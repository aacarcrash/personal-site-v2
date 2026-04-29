"""
Migrate the 4 JSON files from the old CRA project into a single typed projects.ts.

Default axis assignments are intelligent guesses; tier classification follows the plan.
Hand-tune output afterward.

Run from personal-site-v2 directory:
  python scripts/migrate-data.py
"""

import json
import re
from pathlib import Path

OLD_SRC = Path("D:/DocumentsD/cs-projects/personal-site/src")
OUT = Path("D:/DocumentsD/cs-projects/personal-site-v2/data/_projects.regenerated.ts")


def slugify(name: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9]+", "-", name).strip("-").lower()
    return s


def fix_quotes(s: str) -> str:
    """Replace smart quotes that JSON parsing left as garbage."""
    return (
        s.replace("“", '"')
        .replace("”", '"')
        .replace("‘", "'")
        .replace("’", "'")
        .replace("�", '"')  # the bad char in "Real" Art
    )


def fix_link(link: str) -> str:
    """Convert ../images/foo.png → /images/foo.png; leave embed urls alone."""
    if link.startswith("http"):
        return link
    return link.replace("../images/", "/images/").replace("../", "/")


# Year inferred from date string
def infer_year(date: str) -> str:
    m = re.search(r"(2025|2024|2023|2022)", date)
    return m.group(1) if m else "2023"


# Project-by-project axis map. id => (medium, concern, technology, context, featured, tier, role, company, location)
# Source: the framing tiers section of the build plan + verified CV
PROJECT_META = {
    "land": ("Film", "Spatial", "Game engine", "Art", False, "art", None, None, None),
    "callback": ("Web", "Interface", "Web", "Product", True, "case-study", "Fullstack Software Engineer", "Callback", "Tokyo / Remote"),
    "nyu-tandon-the-yard": ("Film", "Spatial", "Game engine", "Education", False, "case-study", "XR Research Fellow", "NYU Tandon @ The Yard", "Brooklyn, NY"),
    "neeeu": ("XR", "Spatial", "Game engine", "Client", True, "case-study", "Creative Technologist", "NEEEU Spaces GmbH", "Berlin"),
    "to-water-a-dying-garden": ("Installation", "Spatial", "Creative coding", "Art", False, "art", None, None, None),
    "fat32-loss-protocol": ("Installation", "Archive", "Creative coding", "Art", False, "art", None, None, None),
    "synapse": ("Web", "Visual study", "Web", "Art", False, "light", None, None, None),
    "abandoned-hotels-of-zangsti": ("Film", "Archive", "Game engine", "Art", False, "art", None, None, None),
    "in-loving-memory-of": ("Film", "Archive", "Game engine", "Art", False, "art", None, None, None),
    "pxe": ("Film", "Visual study", "3D/Render", "Art", False, "art", None, None, None),
    "is-it-cold-in-the-water": ("Film", "Visual study", "3D/Render", "Art", False, "art", None, None, None),
    "electronicos-fantasticos": ("Sound", "Performance", "Hardware", "Art", False, "art", None, None, None),
    "faceshopping": ("XR", "Archive", "3D/Render", "Art", False, "art", None, None, None),
    "aloegarten": ("XR", "Spatial", "Game engine", "Art", False, "art", None, None, None),
    "real-art": ("Web", "Archive", "Web", "Art", False, "light", None, None, None),
    "komposition": ("XR", "Visual study", "Game engine", "Art", False, "art", None, None, None),
    "cryoponics": ("Film", "Visual study", "3D/Render", "Art", False, "art", None, None, None),
    "camjam": ("Web", "Performance", "Web", "Art", False, "art", None, None, None),
    "genesis": ("XR", "Performance", "Web", "Art", False, "art", None, None, None),
}


# Cluster-only axis map — these come from renderData.json
CLUSTER_META = {
    "shaders": ("Shader", "Visual study", "Shader/GPU", "Art"),
    "live-coding-performance": ("Sound", "Performance", "Creative coding", "Art"),
    "unreal-engine": ("Film", "Visual study", "Game engine", "Education"),
    "touchdesigner": ("Visualisation", "Visual study", "Creative coding", "Education"),
    "live-sets": ("Visualisation", "Performance", "Creative coding", "Art"),
    "augmented-reality": ("XR", "Spatial", "Game engine", "Art"),
}


# Items in renderData that should become standalone projects (not clusters)
SOLO_FROM_RENDERS = {
    "displacement-map": ("Installation", "Archive", "3D/Render", "Art"),
    "communication-plateau": ("Installation", "Spatial", "Hardware", "Art"),
    "glitch-princess": ("Web", "Performance", "Web", "Art"),
}


def ts_str(s: str) -> str:
    """JSON-stringify a value for safe TS embedding."""
    return json.dumps(s, ensure_ascii=False)


def block_to_ts(b) -> str:
    if isinstance(b, str):
        return "{ text: " + ts_str(fix_quotes(b)) + " }"
    parts = []
    if b.get("header"):
        parts.append(f'header: {ts_str(fix_quotes(b["header"]))}')
    parts.append(f'text: {ts_str(fix_quotes(b.get("text", "")))}')
    return "{ " + ", ".join(parts) + " }"


def block_first_text(b) -> str:
    if isinstance(b, str):
        return b
    return b.get("text", "") if isinstance(b, dict) else ""


def media_to_ts(m: dict) -> str:
    parts = [f'link: {ts_str(fix_link(m.get("link", "")))}']
    parts.append(f'type: {ts_str(m.get("type", "image"))}')
    if m.get("caption"):
        parts.append(f'caption: {ts_str(fix_quotes(m["caption"]))}')
    if m.get("sourceLink"):
        parts.append(f'sourceLink: {ts_str(m["sourceLink"])}')
    return "{ " + ", ".join(parts) + " }"


def project_entry(item: dict, year: str, axes: tuple, featured: bool, tier: str, role, company, location) -> str:
    name = fix_quotes(item["name"])
    slug = slugify(name)
    medium, concern, technology, context, *_ = axes
    media = item.get("media", [])
    description = item.get("description", [])
    thumb = fix_link(media[0]["link"]) if media else ""

    lines = [
        f"  {{",
        f"    id: {ts_str(slug)},",
        f"    slug: {ts_str(slug)},",
        f"    name: {ts_str(name)},",
        f"    type: 'project',",
        f"    axes: {{ year: '{year}', medium: '{medium}', concern: '{concern}', technology: '{technology}', context: '{context}' }},",
        f"    featured: {str(featured).lower()},",
        f"    tier: '{tier}',",
        f"    thumbnail: {ts_str(thumb)},",
        f"    subtitle: {ts_str(fix_quotes((block_first_text(description[0]) if description else '')[:120].strip()))},",
        f"    date: {ts_str(item.get('date', ''))},",
        f"    technology: {ts_str(item.get('technology', ''))},",
    ]
    if role:
        lines.append(f"    role: {ts_str(role)},")
    if company:
        lines.append(f"    company: {ts_str(company)},")
    if location:
        lines.append(f"    location: {ts_str(location)},")
    if item.get("sourceCode"):
        lines.append(f"    sourceCode: {ts_str(item['sourceCode'])},")
    if item.get("liveLink"):
        lines.append(f"    liveLink: {ts_str(item['liveLink'])},")

    desc_str = ",\n      ".join(block_to_ts(b) for b in description)
    media_str = ",\n      ".join(media_to_ts(m) for m in media)
    lines.append(f"    description: [\n      {desc_str}\n    ],")
    lines.append(f"    media: [\n      {media_str}\n    ],")
    lines.append("  },")
    return "\n".join(lines)


def cluster_entry(item: dict, year: str, axes: tuple, count: int) -> str:
    name = fix_quotes(item["name"])
    slug = slugify(name)
    medium, concern, technology, context = axes
    media = item.get("media", [])
    thumb = fix_link(media[0]["link"]) if media else ""

    items = []
    for m in media:
        title_parts = []
        if m.get("caption"):
            title_parts.append(fix_quotes(m["caption"]))
        item_obj = {
            "title": title_parts[0] if title_parts else name,
            "link": fix_link(m.get("link", "")),
            "type": m.get("type", "image"),
        }
        if m.get("sourceLink"):
            item_obj["source"] = m["sourceLink"]
        items.append(item_obj)
    items_ts = ",\n      ".join(
        "{ " + ", ".join(f"{k}: {ts_str(v)}" for k, v in it.items()) + " }"
        for it in items
    )

    return f"""  {{
    id: {ts_str(slug)},
    name: {ts_str(name)},
    type: 'cluster',
    axes: {{ year: '{year}', medium: '{medium}', concern: '{concern}', technology: '{technology}', context: '{context}' }},
    featured: false,
    thumbnail: {ts_str(thumb)},
    date: {ts_str(item.get('date', ''))},
    technology: {ts_str(item.get('technology', ''))},
    count: {count},
    items: [
      {items_ts}
    ],
  }},"""


def main():
    work = json.load(open(OLD_SRC / "workData.json", encoding="utf-8"))["data"]
    renders = json.load(open(OLD_SRC / "renderData.json", encoding="utf-8"))["data"]
    ue = json.load(open(OLD_SRC / "unrealEngineData.json", encoding="utf-8"))["data"]
    td = json.load(open(OLD_SRC / "touchDesignerData.json", encoding="utf-8"))["data"]

    project_entries = []
    cluster_entries = []

    # workData → projects (skip "More Work..." placeholder)
    for item in work:
        if item["name"].startswith("More Work"):
            continue
        slug = slugify(fix_quotes(item["name"]))
        meta = PROJECT_META.get(slug)
        if not meta:
            print(f"WARN: no axis meta for {slug}, using defaults")
            meta = ("Web", "Interface", "Web", "Art", False, "art", None, None, None)
        medium, concern, technology, context, featured, tier, role, company, location = meta
        year = infer_year(item.get("date", ""))
        project_entries.append(
            project_entry(item, year, (medium, concern, technology, context), featured, tier, role, company, location)
        )

    # renderData → mostly clusters, some solo projects
    for item in renders:
        slug = slugify(fix_quotes(item["name"]))
        if slug in SOLO_FROM_RENDERS:
            axes = SOLO_FROM_RENDERS[slug]
            year = infer_year(item.get("date", ""))
            project_entries.append(
                project_entry(
                    item, year, (*axes, False, "art", None, None, None)[:4],
                    False, "art", None, None, None,
                )
            )
        elif slug in CLUSTER_META:
            axes = CLUSTER_META[slug]
            year = infer_year(item.get("date", ""))
            count = len(item.get("media", []))
            # Special-case: shaders cluster has 11 pieces per spec; UE has more from unrealEngineData
            if slug == "unreal-engine":
                count = len(ue)
                # merge UE items into the cluster's media for richer content
                for ue_item in ue:
                    item.setdefault("media", []).extend(ue_item.get("media", []))
            elif slug == "touchdesigner":
                count = len(td)
                for td_item in td:
                    item.setdefault("media", []).extend(td_item.get("media", []))
            cluster_entries.append(cluster_entry(item, year, axes, count))
        else:
            print(f"WARN: render item {slug} not classified, skipping")

    out = """// AUTO-GENERATED by scripts/migrate-data.py — hand-tune as needed.
// Source: src/{workData,renderData,unrealEngineData,touchDesignerData}.json from old CRA project.

import type { ProjectOrCluster } from './types';

export const projects: ProjectOrCluster[] = [
"""
    out += "\n".join(project_entries)
    out += "\n"
    out += "\n".join(cluster_entries)
    out += "\n];\n"

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(out, encoding="utf-8")
    print(f"Wrote {OUT}")
    print(f"  {len(project_entries)} projects, {len(cluster_entries)} clusters")


if __name__ == "__main__":
    main()
