"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import ToastNotice from "@/components/ui/ToastNotice";
import {
  useCreateCollectionMutation,
  useGetCollectionByIdQuery,
  useUpdateCollectionMutation,
} from "@/redux/apis/pagepalEndpoints";
import CollectionForm from "@/components/forms/CollectionForm";
import { CollectionFormValues } from "@/schemas/pagepalForms";
import { isShelfCollectionName } from "@/utils/bookUtil";

export function CollectionCreateEditScreen({ collectionId }: { collectionId?: string }) {
  const [toastOpen, setToastOpen] = useState(false);
  const { data: current } = useGetCollectionByIdQuery(collectionId ?? "", { skip: !collectionId });
  const [createCollection, { isLoading: creating }] = useCreateCollectionMutation();
  const [updateCollection, { isLoading: updating }] = useUpdateCollectionMutation();
  const isShelfCollection = isShelfCollectionName(current?.name ?? "");

  const initialValues = current
    ? {
        name: current.name,
        description: current.description,
        isPublic: current.visibility === "public",
      }
    : undefined;

  const handleSubmit = async (values: CollectionFormValues) => {
    const payload = isShelfCollection ? { ...values, name: current?.name ?? "Shelf" } : values;

    if (collectionId) {
      await updateCollection({ id: collectionId, ...payload }).unwrap();
    } else {
      await createCollection(payload).unwrap();
    }

    setToastOpen(true);
  };

  return (
    <AppShell zone="D" pageTitle={collectionId ? "Edit Collection" : "New Collection"}>
      <section className="space-y-4">
        <h1 className="serif-display text-2xl text-text">{collectionId ? "Edit Collection" : "Create Collection"}</h1>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <CollectionForm
            initialValues={initialValues}
            submitLabel={collectionId ? "Save changes" : "Create collection"}
            onSubmit={handleSubmit}
            isSubmitting={creating || updating}
            disableName={isShelfCollection}
          />
        </div>
      </section>
      <ToastNotice open={toastOpen} onClose={() => setToastOpen(false)} message="Collection saved." />
    </AppShell>
  );
}
