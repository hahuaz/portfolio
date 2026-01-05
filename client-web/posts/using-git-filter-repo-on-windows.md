---
title: "Using git filter-repo on Windows"
summary: "Working with Linux-based tools on Windows can sometimes be challenging. In this blog post, we will explore how can we remove a file from Git history using git-filter-repo."
createdAt: "2023-07-08"
tags: ['git']
image: '/images/posts/general/git.png'
---
## Introduction
The blog post will cover the installation process of git-filter-repo on Windows, along with a detailed guide on using the tool to filter the Git history and remove the specific file you want to exclude. 

We will use pip to install the [git-filter-repo](https://pypi.org/project/git-filter-repo/) module.

```bash
pip install git-filter-repo
```

After the successfull installation, the path for your site packages will be printed in terminal. 
![install-git-filter-repo](/images/posts/using-git-filter-repo-in-windows/install-git-filter-repo.png)

Open this path in file explorer and copy the git_filter_repo.py file to your clipboard.
![file-explorer](/images/posts/using-git-filter-repo-in-windows/file-explorer.png)

We need to paste this file into your git-core directory. To open your git-core directory in file explorer run:

```bash
start "" "$(git --exec-path)"
```

Now we can use `git filter-repo` command to remove a file from git history 

```bash
git filter-repo --invert-paths --path RELATIVE_PATH_TO_YOUR_FILE
```

## Error you may encounter
While using `git filre-repo` if you got an error saying python3 is not defined it's because your python directory lacks `python3.exe` and your python executable is likely named `python.exe`.

If you open the git_filter_repo.py that you copy/pasted and look the first line, you will find `#!/usr/bin/env python3`. This is called a shebang. It is commonly found at the beginning of a script file in Unix-like operating systems. It is instruction to the operating system, specifying which interpreter should be used to execute the script. In this case, python3 is specified as the interpreter. But as I mentioned your python directory lacks `python3.exe` and we need to create it.

First learn your python directry path

```bash
where python
```

And use this path to create `python3.exe` in the same directory as `python.exe`, run:

```bash
copy "C:\path\to\python.exe" "C:\path\to\python3.exe"
```





