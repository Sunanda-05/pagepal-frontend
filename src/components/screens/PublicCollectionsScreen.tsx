"use client";

import React, {  } from "react";
import AppShell from "@/components/layout/AppShell";
import CollectionCard from "@/components/ui/CollectionCard";
import EmptyState from "@/components/ui/EmptyState";
import { BookCardSkeleton } from "@/components/ui/Skeletons";
import {
  useGetPublicCollectionsQuery,
} from "@/redux/apis/pagepalEndpoints";

export function PublicCollectionsScreen() {
  const { data, isLoading } = useGetPublicCollectionsQuery();
  const collections = data?.items ?? [];

  return (
    <AppShell zone="D" pageTitle="Public Collections">
      <section className="space-y-4">
        <header>
          <h2 className="serif-display text-[20px] text-text">Public collections</h2>
          <p className="text-[13px] text-text-secondary">Explore reading lists curated by the community.</p>
        </header>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <BookCardSkeleton />
            <BookCardSkeleton />
            <BookCardSkeleton />
          </div>
        ) : collections.length === 0 ? (
          <EmptyState title="No public collections yet." />
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}