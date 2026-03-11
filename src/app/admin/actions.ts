'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// Vérifie que l'appelant est bien l'admin
async function assertAdmin() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    throw new Error('Accès non autorisé');
  }
}

// ── TCB Requests ──────────────────────────────────────

export async function approveTcbMember(requestId: string, userId: string) {
  await assertAdmin();

  // 1. Mettre à jour le statut de la demande
  await supabaseAdmin
    .from('tcb_requests')
    .update({ status: 'approved' })
    .eq('id', requestId);

  // 2. Ajouter tcb_member: true aux métadonnées de l'utilisateur
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { tcb_member: true },
  });

  if (error) throw new Error(error.message);
  revalidatePath('/admin');
}

export async function rejectTcbMember(requestId: string) {
  await assertAdmin();

  await supabaseAdmin
    .from('tcb_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId);

  revalidatePath('/admin');
}

// ── Vidéos CRUD ───────────────────────────────────────

export async function createVideo(formData: FormData) {
  await assertAdmin();

  const payload = {
    title:               formData.get('title') as string,
    description:         formData.get('description') as string,
    url:                 formData.get('url') as string,
    poster_url:          formData.get('poster_url') as string,
    platform:            (formData.get('platform') as string) || 'youtube',
    competition_context: formData.get('competition_context') as string || null,
    duration:            Number(formData.get('duration')) || 0,
  };

  const { error } = await supabaseAdmin.from('videos').insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath('/admin');
  revalidatePath('/');
}

export async function updateVideo(id: string, formData: FormData) {
  await assertAdmin();

  const payload = {
    title:               formData.get('title') as string,
    description:         formData.get('description') as string,
    url:                 formData.get('url') as string,
    poster_url:          formData.get('poster_url') as string,
    platform:            (formData.get('platform') as string) || 'youtube',
    competition_context: formData.get('competition_context') as string || null,
    duration:            Number(formData.get('duration')) || 0,
  };

  const { error } = await supabaseAdmin.from('videos').update(payload).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin');
  revalidatePath('/');
}

export async function deleteVideo(id: string) {
  await assertAdmin();

  const { error } = await supabaseAdmin.from('videos').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin');
  revalidatePath('/');
}
