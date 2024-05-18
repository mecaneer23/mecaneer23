#!/bin/bash

update() {
  commit_message="Update recent commit SVG from $(cat prev-file-name.txt) to $(cat current-file-name.txt)"
  echo $(cat current-file-name.txt) > prev-file-name.txt
  echo $commit_message

  git config --global user.name 'GitHub Actions'
  git config --global user.email 'actions@github.com'
  git add README.md prev-file-name.txt
  git diff --staged --quiet README.md || git commit -m "$commit_message"
  git push
}

if [ -f current-file-name.txt ]; then
  update;
else
  echo "Repo hasn't changed";
fi;
