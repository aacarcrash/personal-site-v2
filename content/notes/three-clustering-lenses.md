---
title: Three clustering lenses instead of one slider
author: Aakarsh Singh
date: 2026-05-07
description: A UI decision in Mare — why we exposed three discrete clustering lenses instead of a similarity slider.
tags: [mare, clustering, ml, ui, product-decisions]
---

# Three clustering lenses instead of one slider

Mare clusters the same library three ways at once: Balanced, Aesthetic, and Semantic. There's a Recluster button between the lenses; switching produces different clusters from the same items. Most reference tools that do anything like this expose a single similarity slider — "loose" to "strict" or "broad" to "narrow." We considered a slider and rejected it.

## What a slider actually says

A slider promises that the underlying signal is one continuous variable and that the user is only choosing how much of it to show: *more related* or *less related* along one axis.

That promise is a lie when the underlying signal is heterogeneous. In Mare, "related" can mean a few quite different things to a designer or artist looking at their archive:

- These two posters share a color palette and a print finish.
- These two photographs share a subject. Both are images of horses, regardless of how they look.
- These two screenshots come from work I made for the same client, even though they look nothing alike.

The three are aesthetic similarity, semantic similarity, and provenance, and they aren't points on the same axis. Asking the user to find the "right" slider position implies there's one right answer they only have to dial in, when no such answer exists.

## What we built instead

Three discrete lenses each cluster the same library differently. The user picks the frame they want, and the algorithm reshapes everything around that frame.

- **Balanced** combines several embedding signals roughly equally. This is the default. It tends to surface the mixed-rationale clusters most designers have in their heads, the *things-that-go-together-for-reasons-I-haven't-fully-articulated* groupings.
- **Aesthetic** weights the visual features harder: color, composition, texture, and print finish. A poster collection seen through this lens regroups around look and feel.
- **Semantic** weights the meaning side: what the image depicts, what topics the linked articles cover, what tags and surrounding metadata imply. Two images with totally different palettes can land in the same cluster if they're both of staircases.

Under the hood there is no knob on one algorithm. The clustering layer is an ensemble of density-based, graph-community, and agglomerative approaches running over a hybrid embedding (semantic with a metadata bias), and each lens weights the components of that ensemble differently. The control the user sees stands for three different recipes rather than one number being scaled.

Membership is soft, so an item can belong to more than one cluster when the algorithms disagree productively. Clusters that grow past navigability auto-split. LLM-generated labels run over a small handful of representatives per cluster, so the labels stay grounded in what's actually there rather than averaging the whole thing into something blandly correct.

## Why there's a Recluster button

The Recluster button next to the lens picker is deliberate. Switching lenses isn't something we recompute in the background or animate smoothly into, so the user has to explicitly say "redo this."

The button matters for two reasons. First, the lenses are work. A reclustering pass is a meaningful compute step, and we want the user to feel that they're asking for a different reading of the same library, not just toggling a UI state. Second, when the lenses produce visibly different shapes, the surprise feels productive when it follows a button click and disorienting when it happens silently. You click, watch the field rearrange, and look at the new groups, and that friction is what makes the change legible.

## What it gives the user

The user picks a vocabulary rather than a value on a volume control.

In practice, what this enables:

- A user looking for *what would I want to print together this week* picks Aesthetic. The same archive that read as "research notes" on the way in reads as "things that share a paper feel" on the way out.
- A user looking for *everything I've collected about a topic, regardless of medium* picks Semantic. Linked articles, tagged photos, screenshots of essays all collapse into one cluster.
- A user trying to recover a half-remembered sense of what they were thinking last month picks Balanced and lets the mixed-rationale clusters do the work memory does.

These are different tools for different sessions rather than different intensities, which a slider would have hidden.

## What it costs

The tradeoffs:

- **More UI surface.** A slider is one element, where three labeled lenses plus a Recluster button is more and needs a small amount of explaining at first. We accept that cost, because the explanation is short ("which kind of similar do you want right now?") and it surfaces a real choice rather than hiding it under a smooth interaction that quietly does the wrong thing.
- **More compute on demand.** Reclustering is a real pass over the embedding layer. We do it when the user asks rather than precomputing all three lenses for every library on every change.
- **Some users want the slider anyway.** A small fraction of users tell us they'd rather dial it themselves. We've decided not to add it back, because once a slider exists the lenses start to feel like presets, which quietly recreates the original lie that there's one underlying axis.

## When this might change

The decision isn't permanent: if we ever find a meaningful continuous signal that survives across all three readings, we'd reconsider. For now, three discrete lenses is the most honest UI we've found for what's actually happening underneath. The clustering layer is doing several different things at once, and the interface should make that legible to the person looking at their own collection rather than smooth it over with a single control.
