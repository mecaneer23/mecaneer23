#!/bin/bash

update() {
  commit_message="Update recent commit SVG from $(cat prev-repo-name.txt) to $(cat current-repo-name.txt)"
  echo $(cat current-repo-name.txt) > prev-repo-name.txt
  echo $commit_message

  git config --global user.name 'GitHub Actions'
  git config --global user.email 'actions@github.com'
  git add README.md prev-repo-name.txt
  git diff --staged --quiet README.md || git commit -m "$commit_message"
  git push
}

if [ -f current-repo-name.txt ]; then
  update;
else
  echo "Repo hasn't changed";
fi;
