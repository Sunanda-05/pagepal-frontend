"use client";

import React, { useState } from "react";
import {
  IconPlus,
} from "@tabler/icons-react";
import { Button } from "@heroui/button";
import AppShell from "@/components/layout/AppShell";
import CollectionCard from "@/components/ui/CollectionCard";
import EmptyState from "@/components/ui/EmptyState";
import LoadMoreButton from "@/components/ui/LoadMoreButton";
import ToastNotice from "@/components/ui/ToastNotice";
import BottomSheet from "@/components/ui/BottomSheet";
import {
  useCreateCollectionMutation,
  useGetMyCollectionsQuery,
  useGetPublicCollectionsQuery,
  useGetSharedCollectionsQuery,
} from "@/redux/apis/pagepalEndpoints";
import CollectionForm from "@/components/forms/CollectionForm";
import { CollectionFormValues } from "@/schemas/pagepalForms";

export function CollectionsBaseScreen({
  title,
  source,
}: {
  title: string;
  source: "me" | "public" | "shared";
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const meQuery = useGetMyCollectionsQuery(undefined, { skip: source !== "me" });
  const publicQuery = useGetPublicCollectionsQuery(undefined, { skip: source !== "public" });
  const sharedQuery = useGetSharedCollectionsQuery(undefined, { skip: source !== "shared" });

  const [createCollection, { isLoading: creating }] = useCreateCollectionMutation();

  const sourceData =
    source === "me"
      ? meQuery.data?.items
      : source === "shared"
      ? sharedQuery.data?.items
      : publicQuery.data?.items;

  const collections = sourceData ?? [];
  const canCreate = source === "me";

  const handleCreate = async (values: CollectionFormValues) => {
    await createCollection(values).unwrap();
    setSheetOpen(false);
    setToastOpen(true);
  };

  return (
    <AppShell
      zone={source === "public" ? "A" : "D"}
      pageTitle={title}
      actionSlot={canCreate ? <button type="button" onClick={() => setSheetOpen(true)}><IconPlus size={18} className="text-text-secondary" /></button> : null}
    >
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="serif-display text-2xl text-text">{title}</h1>
          {canCreate ? (
            <Button size="sm" color="primary" onPress={() => setSheetOpen(true)}>
              New collection
            </Button>
          ) : null}
        </div>

        {collections.length === 0 ? (
          <EmptyState title={source === "shared" ? "No shared collections yet." : "No collections yet. Start one."} subtitle={source === "me" ? "Create your first collection to organize books." : "Collections will appear here when available."} />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {canCreate ? (
                <button
                  type="button"
                  onClick={() => setSheetOpen(true)}
                  className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border text-text-secondary"
                >
                  <IconPlus size={18} />
                  <span className="mt-2 text-sm">New collection</span>
                </button>
              ) : null}
              {collections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
            <LoadMoreButton onClick={() => undefined} label="Load more collections" isDisabled />
          </>
        )}
      </section>

      {canCreate ? (
        <BottomSheet isOpen={sheetOpen} onOpenChange={setSheetOpen} title="Create collection">
          <CollectionForm submitLabel="Create collection" onSubmit={handleCreate} isSubmitting={creating} />
        </BottomSheet>
      ) : null}

      <ToastNotice open={toastOpen} onClose={() => setToastOpen(false)} message="Collection created." />
    </AppShell>
  );
}