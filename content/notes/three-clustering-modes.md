---
title: Three clustering modes instead of one slider
author: Aakarsh Singh
date: 2026-05-07
description: A UI decision in Mare — why we exposed three discrete clustering modes instead of a similarity slider.
tags: [mare, clustering, ml, ui, product-decisions]
---

# Three clustering modes instead of one slider

Mare clusters the same library three ways at once. Balanced, Aesthetic, Semantic. There's a Recluster button between the modes; switching produces different clusters from the same items. Most reference tools that do anything like this expose a single similarity slider — "loose" to "strict" or "broad" to "narrow." We considered that and rejected it. Here's why.

## What a slider actually says

A slider is a UI promise. It promises the underlying signal is one continuous variable, and the user is choosing how much of it to show. *More related* or *less related* along one axis.

That promise is a lie when the underlying signal is heterogeneous. In Mare, "related" can mean a few quite different things to a designer or artist looking at their archive:

- These two posters share a color palette and a print finish.
- These two photographs share a subject. Both are images of horses, regardless of how they look.
- These two screenshots come from work I made for the same client, even though they look nothing alike.

The first is aesthetic similarity. The second is semantic. The third is provenance. They're not points on the same axis. Asking the user to find the "right" slider position implies there's one right answer and they just have to dial it in. There isn't.

## What we built instead

Three discrete modes. Each is the same library clustered differently. The user picks the frame they want; the algorithm reshapes everything around that frame.

- **Balanced** combines several embedding signals roughly equally. This is the default. It tends to surface the kind of mixed-rationale clusters most designers actually have in their heads, the *things-that-go-together-for-reasons-I-haven't-fully-articulated* groupings.
- **Aesthetic** weights the visual features harder. Color, composition, texture, print finish. A poster collection in this mode regroups around look and feel.
- **Semantic** weights the meaning side: what the image depicts, what topics the linked articles cover, what tags and surrounding metadata imply. Two images with totally different palettes can land in the same cluster if they're both of staircases.

Under the hood it isn't a knob on one algorithm. The clustering layer is an ensemble of density-based, graph-community, and agglomerative approaches running over a hybrid embedding (semantic with a metadata bias). Each mode weights the components of that ensemble differently. The knob the user sees isn't a single number we're scaling; it's three different recipes.

Membership is soft, so an item can belong to more than one cluster when the algorithms disagree productively. Clusters that grow past navigability auto-split. LLM-generated labels run over a small handful of representatives per cluster, so the labels stay grounded in what's actually there rather than averaging the whole thing into something blandly correct.

## Why there's a Recluster button

There's a Recluster button next to the mode picker. It's deliberate. Mode switches aren't something we recompute in the background or animate smoothly into. The user has to explicitly say "redo this."

The button matters for two reasons. First, the modes are work. A reclustering pass is a meaningful compute step, and we want the user to feel that they're asking for a different reading of the same library, not just toggling a UI state. Second, when the modes produce visibly different shapes, the surprise feels productive when it follows a button click and disorienting when it happens silently. Click, watch the field rearrange, look at the new groups. The friction is the point.

## What it gives the user

Three frames, not one volume control. The user picks a vocabulary, not a value.

In practice, what this enables:

- A user looking for *what would I want to print together this week* picks Aesthetic. The same archive that read as "research notes" on the way in reads as "things that share a paper feel" on the way out.
- A user looking for *everything I've collected about a topic, regardless of medium* picks Semantic. Linked articles, tagged photos, screenshots of essays all collapse into one cluster.
- A user trying to recover a half-remembered sense of what they were thinking last month picks Balanced and lets the mixed-rationale clusters do the work memory does.

These aren't different intensities. They're different tools for different sessions. A slider would have hidden that.

## What it costs

The honest tradeoffs:

- **More UI surface.** A slider is one element. Three labeled modes plus a Recluster button is more, and the modes need a small amount of explaining at first. We accept that. The explanation is short ("which kind of similar do you want right now?") and it surfaces a real choice rather than hiding it under a smooth interaction that quietly does the wrong thing.
- **More compute on demand.** Reclustering is a real pass over the embedding layer. We do it when the user asks rather than precomputing all three modes for every library on every change.
- **Some users want the slider anyway.** A small fraction of users tell us they'd rather just dial it. We hear that and have decided not to add it back, because once a slider exists, the modes start to feel like presets — and that quietly recreates the original lie that there's one underlying axis.

## When this might change

The decision isn't permanent. If we ever find a meaningful continuous signal that survives across all three readings, we'd reconsider. For now, three discrete modes is the most honest UI we've found for what's actually happening underneath. The clustering layer is doing several different things at once, and the interface should make that legible to the person looking at their own collection rather than smooth it over with a single control.
