#!/bin/bash

commit_message="Update recent commit SVG from $(cat prev-file-name.txt) to $(cat current-file-name.txt)"
echo $(cat current-file-name.txt) > prev-file-name.txt
echo $commit_message

git config --global user.name 'GitHub Actions'
git config --global user.email 'actions@github.com'
# git add README.md
git add recent-commit.svg current-file-name.txt prev-file-name.txt
git diff --quiet && git diff --staged --quiet || git commit -m "$commit_message"
git push
