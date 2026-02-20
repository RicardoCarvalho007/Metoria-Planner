"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveNote(
  topicId: string,
  subtopicId: string | null,
  content: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("topic_notes")
    .upsert(
      {
        user_id: user.id,
        topic_id: topicId,
        subtopic_id: subtopicId,
        content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,topic_id,subtopic_id" }
    );

  if (error) return { error: error.message };

  revalidatePath("/topics");
  return { success: true };
}

export async function deleteNote(noteId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("topic_notes")
    .delete()
    .eq("id", noteId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/topics");
  return { success: true };
}

export async function uploadFile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const file = formData.get("file") as File | null;
  const topicId = formData.get("topicId") as string;
  const subtopicId = (formData.get("subtopicId") as string) || null;

  if (!file || !topicId) return { error: "Missing file or topic" };

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${user.id}/${topicId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("topic-files")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("topic-files").getPublicUrl(path);

  const { error: dbError } = await supabase.from("topic_uploads").insert({
    user_id: user.id,
    topic_id: topicId,
    subtopic_id: subtopicId,
    file_name: file.name,
    file_url: publicUrl,
    file_type: file.type,
    file_size: file.size,
  });

  if (dbError) return { error: dbError.message };

  revalidatePath("/topics");
  return { success: true, url: publicUrl };
}

export async function deleteFile(uploadId: string, fileUrl: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Extract storage path from URL
  const bucketBase = "/storage/v1/object/public/topic-files/";
  const pathIdx = fileUrl.indexOf(bucketBase);
  if (pathIdx >= 0) {
    const storagePath = fileUrl.slice(pathIdx + bucketBase.length);
    await supabase.storage.from("topic-files").remove([storagePath]);
  }

  const { error } = await supabase
    .from("topic_uploads")
    .delete()
    .eq("id", uploadId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/topics");
  return { success: true };
}
