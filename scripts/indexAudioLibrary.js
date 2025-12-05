// scripts/indexAudioLibrary.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

// IMPORTANT: this must match your actual bucket name
const BUCKET = 'Hedgies_Studios_Audio_Library';

// Base folder inside the bucket we care about
const BASE_PREFIX = 'Purchased_Libraries/Other_External_Packs';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE env vars. Set NEXT_PUBLIC_SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY.');
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

type StorageFile = {
  name: string;
  id?: string;
  updated_at?: string;
  created_at?: string;
  last_accessed_at?: string;
  metadata?: {
    size?: number;
    mimetype?: string;
    [key: string]: any;
  };
};

async function listFolders(prefix: string): Promise<string[]> {
  const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
    limit: 2000,
    sortBy: { column: 'name', order: 'asc' },
  });

  if (error) {
    console.error('Error listing folders at', prefix, error);
    throw error;
  }

  return (data || [])
    .filter((item: any) => item.name && item.id === undefined) // folders have no id in list()
    .map((item: any) => item.name);
}

async function listFiles(prefix: string): Promise<StorageFile[]> {
  const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
    limit: 2000,
    sortBy: { column: 'name', order: 'asc' },
  });

  if (error) {
    console.error('Error listing files at', prefix, error);
    throw error;
  }

  return (data || []).filter((item: any) => !!item.id);
}

function inferCategoryFromPack(pack: string): string | null {
  const lower = pack.toLowerCase();
  if (lower.includes('ambience') || lower.includes('ambiences')) return 'Ambience';
  if (lower.includes('foley')) return 'Foley';
  if (lower.includes('radio')) return 'Comms';
  if (lower.includes('alarm')) return 'Alarms';
  if (lower.includes('movement') || lower.includes('clothes')) return 'Movement';
  return null;
}

async function upsertAudioAsset(
  storagePath: string,
  file: StorageFile,
  pack: string,
  libraryGroup: string,
) {
  const category = inferCategoryFromPack(pack);
  const fileName = file.name;
  const sizeBytes = file.metadata?.size ?? null;

  const { error } = await supabase.from('audio_assets').upsert(
    {
      bucket: BUCKET,
      storage_path: storagePath,
      file_name: fileName,
      pack,
      library_group: libraryGroup,
      category,
      size_bytes: sizeBytes,
    },
    { onConflict: 'storage_path' },
  );

  if (error) {
    console.error(`Error upserting asset for ${storagePath}`, error.message);
  } else {
    console.log('Indexed:', storagePath);
  }
}

async function run() {
  console.log('Indexing Hedgies Audio Library…');

  // 1) get the pack folders under Purchased_Libraries/Other_External_Packs
  const packs = await listFolders(BASE_PREFIX);
  console.log('Found packs:', packs);

  for (const pack of packs) {
    const packPrefix = `${BASE_PREFIX}/${pack}`;
    const files = await listFiles(packPrefix);
    console.log(`  Pack "${pack}" – ${files.length} files`);

    for (const file of files) {
      const fullPath = `${packPrefix}/${file.name}`;
      await upsertAudioAsset(fullPath, file, pack, 'Other_External_Packs');
    }
  }

  console.log('✅ Done indexing audio_assets');
}

// Allow running via `node` or `ts-node`
run().catch((err) => {
  console.error('Fatal error while indexing audio library:', err);
  process.exit(1);
});
