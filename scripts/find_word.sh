#!/bin/bash

if [ -z "$1" ]; then
    echo "Введите слово для поиска."
    exit 1
fi

search_word=$1
found=0

while IFS= read -r file; do
    count=$(grep -o -i -w "$search_word" "$file" | wc -l)
    if [ "$count" -gt 0 ]; then
        echo "Файл: $file - Найдено вхождений: $count"
        found=1
    fi
done < <(find . -type f \( -name "*.ts" -o -name "*.proto" -o -name "*.prisma" -o -name "*.env" -o -name "*.yml" -o -name "*.py" -o -name "*.js" -o -name "*.sh" -o -name "*.md" -o -name "Dockerfile" \) \
    ! -path "*/node_modules/*" \
    ! -path "*/dist/*" \
    ! -path "*/protos/*" \
    ! -path "*/data/*" \
    ! -path "*/angular/*" ! -name "angular" \
    ! -path "*/data/postgres_data/*")

if [ "$found" -eq 0 ]; then
    echo "Слово '$search_word' слово не найдено."
fi
