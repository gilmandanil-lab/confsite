#!/bin/sh
API="http://localhost:8084/api"

echo "=== Login ==="
curl -s -c /tmp/cookies.txt -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}' | grep -o '"email":"[^"]*"\|"status":"[^"]*"'

echo ""
echo "=== Create Talk ==="
curl -s -b /tmp/cookies.txt -X POST "$API/participant/talks" \
  -H "Content-Type: application/json" \
  -d '{"kind":"ORAL","title":"Тестовый доклад","abstract":"В данном докладе будут рассмотрены основные теплофизические свойства плазмы, включая теплопроводность, теплоемкость и вязкость. Будут проанализированы экспериментальные данные, полученные при различных температурах и давлениях. Особое внимание уделено влиянию состава на параметры плазмы.","authors":[{"fullName":"Иван Иванов","affiliation":"МГУ"}],"sectionId":"7cf2a427-84b2-4b0c-94e9-341b1cc51ee9","affiliation":"МГУ"}'

echo ""
echo "=== Public Program ==="
curl -s "$API/public/program" | grep -o '"title":"[^"]*"' | head -3



