#!/usr/bin/env python3
"""Generate supabase/migrations/004_seed_full_catalog.sql from recipes.dump.json"""
import json, re

DUMP = r"C:\Users\shafnats\AppData\Local\Temp\recipes.dump.json"
OUT = r"C:\Users\shafnats\Development\BimaSorgum\supabase\migrations\004_seed_full_catalog.sql"

# deterministic uuid from source_id string
import hashlib
def rid(source_id: str) -> str:
    h = hashlib.sha256(source_id.encode()).hexdigest()
    return f"{h[0:8]}-{h[8:12]}-4{h[13:16]}-{h[16:20]}-{h[20:32]}"

def esc(s):
    if s is None: return "NULL"
    return "'" + str(s).replace("'", "''") + "'"

def cat_key(label: str) -> str:
    label = label.lower()
    if 'camilan' in label or 'kue kering' in label or 'cookie' in label: return 'camilan_sehat'
    if 'minuman' in label or 'dawet' in label or 'cendol' in label or 'susu' in label and 'milkshake' in label: return 'minuman_nutrisi'
    if 'dessert' in label or 'puding' in label or 'bolu' in label: return 'dessert_rendah_gi'
    return 'makanan_berat'

def esc_arr(arr):
    if not arr: return "'{}'"
    return "array[" + ",".join(esc(x) for x in arr) + "]"

def num(v):
    return "NULL" if v is None else str(v)

data = json.load(open(DUMP, encoding='utf-8'))

lines = []
lines.append("-- ============================================================")
lines.append("-- SorghumCare (BimaSorgum) — Migration 004: FULL SYSTEM CATALOG SEED")
lines.append("-- Generated from src/data (source of truth). Idempotent (upsert by source_id).")
lines.append("-- ============================================================")
lines.append("")
lines.append("-- ---------- RECIPES ----------")
seen_rid = set()
for item in data:
    r = item['recipe']
    src_id = r.get('id') or r.get('slug')
    ridv = rid(src_id)
    seen_rid.add(ridv)
    dish_cat = cat_key(r.get('dishCategory',''))
    nh = r.get('nutritionHighlight') or {}
    # title fallback for targetAge
    # Use slug as conflict key (slug has a unique constraint; source_id may collide with seed 002 which lacks source_id)
    slug = r.get('slug') or src_id
    lines.append(f"insert into public.recipes (id, source_id, slug, title, subtitle, image_url, tags, target_age_label, dish_category, prep_time_minutes, cook_time_minutes, servings, estimated_cost, target_budget, calories_estimate, fiber_grams, protein_grams, glycemic_index, nutrition_title, nutrition_description, is_system, is_published, created_at)")
    lines.append(f"values ({esc(ridv)}, {esc(src_id)}, {esc(slug)}, {esc(r.get('title'))}, {esc(r.get('subtitle'))}, {esc(r.get('imageUrl'))}, {esc_arr(r.get('tags', []))}, {esc(r.get('targetAge'))}, {esc(dish_cat)}, {num(r.get('prepTimeMinutes'))}, {num(r.get('cookTimeMinutes'))}, {num(r.get('servings'))}, {num(r.get('estimatedCost'))}, {num(r.get('targetBudget'))}, {num(nh.get('caloriesEstimate'))}, {num(nh.get('fiberGrams'))}, {num(nh.get('proteinGrams'))}, {esc(nh.get('glycemicIndex'))}, {esc(nh.get('title'))}, {esc(nh.get('description'))}, true, true, {esc(r.get('createdAt') or '2026-08-01T00:00:00Z')})")
    lines.append(f"on conflict (slug) do update set source_id=excluded.source_id, title=excluded.title, subtitle=excluded.subtitle, image_url=excluded.image_url, tags=excluded.tags, target_age_label=excluded.target_age_label, dish_category=excluded.dish_category, prep_time_minutes=excluded.prep_time_minutes, cook_time_minutes=excluded.cook_time_minutes, servings=excluded.servings, estimated_cost=excluded.estimated_cost, target_budget=excluded.target_budget, calories_estimate=excluded.calories_estimate, fiber_grams=excluded.fiber_grams, protein_grams=excluded.protein_grams, glycemic_index=excluded.glycemic_index, nutrition_title=excluded.nutrition_title, nutrition_description=excluded.nutrition_description;")
    lines.append("")

lines.append("-- ---------- RECIPE INGREDIENTS ----------")
for item in data:
    r = item['recipe']
    slug = r.get('slug') or (r.get('id') or '')
    rid_sql = f"(select id from public.recipes where slug = {esc(slug)})"
    for idx, ing in enumerate(r.get('ingredients', [])):
        lines.append(f"insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)")
        lines.append(f"select {rid_sql}, {esc(ing.get('name'))}, {esc(ing.get('amount'))}, {esc(ing.get('notes'))}, {num(ing.get('estimatedPrice'))}, {idx}")
        lines.append(f"where exists ({'select 1 from public.recipes where slug = ' + esc(slug)})")
        lines.append(f"on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;")
        lines.append("")

lines.append("-- ---------- RECIPE STEPS ----------")
for item in data:
    r = item['recipe']
    slug = r.get('slug') or (r.get('id') or '')
    rid_sql = f"(select id from public.recipes where slug = {esc(slug)})"
    for st in r.get('steps', []):
        lines.append(f"insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)")
        lines.append(f"select {rid_sql}, {num(st.get('stepNumber'))}, {esc(st.get('title'))}, {esc(st.get('instruction'))}, {num(st.get('timerMinutes'))}, {esc(st.get('tip'))}")
        lines.append(f"where exists ({'select 1 from public.recipes where slug = ' + esc(slug)})")
        lines.append(f"on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;")
        lines.append("")

lines.append("-- ---------- RECIPE TARGETS (inferred from target_age_label) ----------")
def targets_for(age_label: str):
    a = (age_label or '').lower()
    t = []
    if 'balita' in a or 'mpasi' in a: t.append('balita')
    if 'anak sd' in a or 'anak sekolah' in a: t.append('anak_sd'); t.append('anak_sekolah')
    if 'smp' in a: t.append('siswa_smp')
    if 'sma' in a: t.append('siswa_sma')
    if 'remaja' in a or 'dewasa' in a: t.append('remaja_dewasa'); t.append('dewasa_lansia')
    if 'lansia' in a: t.append('lansia')
    if 'semua usia' in a or 'semua' in a: t = ['anak_sd','siswa_smp','siswa_sma','remaja_dewasa','lansia','balita']
    return t

for item in data:
    r = item['recipe']
    slug = r.get('slug') or (r.get('id') or '')
    rid_sql = f"(select id from public.recipes where slug = {esc(slug)})"
    for tg in targets_for(r.get('targetAge','')):
        lines.append(f"insert into public.recipe_targets (recipe_id, target) select {rid_sql}, {esc(tg)} where exists ({'select 1 from public.recipes where slug = ' + esc(slug)}) on conflict do nothing;")
    if not targets_for(r.get('targetAge','')):
        lines.append(f"-- no target inferred for {r.get('slug')}")

lines.append("")
lines.append("-- ---------- INGREDIENT MASTER (from mock DEFAULT_INGREDIENTS) ----------")
# These are kept as-is from migration 002; nothing more needed.

open(OUT, 'w', encoding='utf-8').write("\n".join(lines))
print(f"Wrote {OUT}: {len(lines)} lines, {len(data)} recipes")
