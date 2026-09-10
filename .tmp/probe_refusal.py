import json, urllib.request

BASE = "https://api.llmsorgum.online"
SCHEMA = '{"title":"string","subtitle":"string","targetAge":"string","dishCategory":"string","targetBudget":number,"estimatedCost":number,"prepTimeMinutes":number,"cookTimeMinutes":number,"servings":number,"ingredients":[{"name":"string","amount":"string","estimatedPrice":number}],"nutritionHighlight":{"title":"string","description":"string","fiberGrams":number,"proteinGrams":number,"glycemicIndex":"string","caloriesEstimate":number},"steps":[{"stepNumber":number,"title":"string","instruction":"string","timerMinutes":number}],"tags":["string"]}'

RULES = """ATURAN PENTING (WAJIB diikuti):
1. Jika kombinasi bahan terasa tidak lazim / tidak enak dimakan (mis. madu dicampur terasi, madu dengan cabai pedas, durian dengan petis), JANGAN paksa membuat resep — tolak dengan sopan dan jelaskan alasannya singkat.
2. Harga setiap bahan (estimatedPrice) HARUS realistis sesuai harga pasar Indonesia 2026. JANGAN menurunkan harga demi muat di budget.
3. Jika total harga bahan melebihi budget, jangan paksa — sarankan menaikkan budget atau mengurangi bahan.
4. estimatedCost HARUS SAMA dengan jumlah seluruh estimatedPrice bahan.
5. Respon harus JSON VALID — setiap field harus punya nilai (tidak boleh ada field kosong)."""

def call(prompt):
    req = urllib.request.Request(BASE + "/api/chat",
        data=json.dumps({"message": prompt}).encode(),
        headers={"Content-Type":"application/json","X-Use-RAG":"true","User-Agent":"Mozilla/5.0","Accept":"application/json"},
        method="POST")
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode()).get("response","")

p = f"""Anda adalah SorghumCare AI, koki dan pakar sorgum Indonesia.
Pengguna meminta: "Buatkan resep makan malam dengan daging sapi wagyu dan udang, budget maksimal 20 ribu"
Buatkan 1 resep masakan sorgum sehat dalam format JSON valid tanpa markdown triple backticks dengan struktur:
{SCHEMA}

{RULES}"""

raw = call(p)
print("=== RAW RESPONSE (budget premium) ===")
print(raw)
