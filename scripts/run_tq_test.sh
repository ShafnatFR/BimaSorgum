#!/bin/bash
# Uji TQ end-to-end lewat jalur aplikasi: server lokal (dist + proxy /bima-api) -> backend.
# Argumen: ID kasus (mis. "TQ1-3,TQ2-1") dan timeout klien per request.
# Contoh: bash run_tq_test.sh "TQ1-3,TQ2-1" 140
set -u
IDS="${1:-}"
TC="${2:-95}"
TMP="$LOCALAPPDATA/Temp/bimabug"
cd /c/Users/shafnats/Development/BimaSorgum

(
  while true; do
    node scripts/server_local.cjs ./dist 3000 >> "$TMP/server_local.log" 2>&1
    echo "[supervisor] server berhenti, restart" >> "$TMP/server_local.log"
    sleep 1
  done
) &
SUP=$!
sleep 5
curl -sS -m 10 -o /dev/null -w "app http=%{http_code}\n" http://127.0.0.1:3000/ -H 'User-Agent: Mozilla/5.0'

cd "$TMP"
python tq_test.py --ids "$IDS" --timeout "$TC" --out tq_results_retry.json > tq_retry.log 2>&1

kill $SUP 2>/dev/null
for PID in $(netstat -ano | grep -E "127\.0\.0\.1:3000 .*LISTENING" | awk '{print $NF}' | sort -u); do
  taskkill /F /PID "$PID" >> "$TMP/server_local.log" 2>&1
done
echo "=== hasil retry ==="
tail -30 tq_retry.log
