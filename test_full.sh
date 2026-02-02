#!/bin/sh
API="http://localhost:8084/api"

echo "=== 1. Register user ==="
REG_RESP=$(curl -s -c /tmp/user.txt -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com","password":"password123","name":"Иван","surname":"Петров","patronymic":"Сергеевич"}')
echo "$REG_RESP"

echo ""
echo "=== 2. Login user ==="
curl -s -c /tmp/user.txt -b /tmp/user.txt -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com","password":"password123"}' | grep -o '"email":"[^"]*"\|"status":"[^"]*"'

echo ""
echo "=== 3. Update profile (optional) ==="
curl -s -b /tmp/user.txt -X PUT "$API/participant/profile" \
  -H "Content-Type: application/json" \
  -d '{"city":"Москва","affiliation":"МГУ"}' | head -c 100

echo ""
echo "=== 4. Create talk ==="
TALK_RESP=$(curl -s -b /tmp/user.txt -X POST "$API/participant/talks" \
  -H "Content-Type: application/json" \
  -d '{"kind":"ORAL","title":"Тестовый доклад","abstract":"В данном докладе будут рассмотрены основные теплофизические свойства плазмы, включая теплопроводность, теплоемкость и вязкость. Будут проанализированы экспериментальные данные, полученные при различных температурах и давлениях. Особое внимание уделено влиянию состава на параметры плазмы.","authors":[{"fullName":"Иван Петров","affiliation":"МГУ"}],"sectionId":"7cf2a427-84b2-4b0c-94e9-341b1cc51ee9","affiliation":"МГУ"}')
echo "$TALK_RESP"
TALK_ID=$(echo "$TALK_RESP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Talk ID: $TALK_ID"

echo ""
echo "=== 5. Register ADMIN user ==="
curl -s -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123456","name":"Admin","surname":"User","patronymic":"Test"}' | head -c 100

echo ""
echo "=== 6. Login ADMIN ==="
curl -s -c /tmp/admin.txt -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123456"}' | grep -o '"userId":"[^"]*"'

echo ""
echo "=== 7. Get admin talks (should fail - not admin yet) ==="
curl -s -b /tmp/admin.txt -X GET "$API/admin/talks" | head -c 100

