#!/bin/bash

total_lines=0

while IFS= read -r file; do
    echo "Обрабатываем файл: $file"
    lines=$(wc -l < "$file")
    total_lines=$((total_lines + lines))
done < <(find . -type f \( -name "*.ts" -o -name "*.proto" -o -name "*.prisma" -o -name "*.env" -o -name "*.yml" -o -name "*.py" -o -name "*.js" -o -name "*.sh" -o -name "*.md" -o -name "Dockerfile" \) ! -path "*/node_modules/*" ! -path "*/angular/*" ! -path "*/dist/*" ! -path "*/protos/*" ! -path "*/data/*")

echo "Общее количество строк кода: $total_lines"