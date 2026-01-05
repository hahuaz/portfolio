---
title: "Mirror a website using wget"
summary: "Wget is a command-line tool used to download files from the internet for offline viewing."
createdAt: "2023-08-15"
tags: []
image: '/images/posts/mirror-a-website-using-wget/wget.webp'
---

## Introduction

The wget is a command-line utility used to download files from the internet. It supports HTTP, HTTPS, and FTP protocols and can be used to download single files, multiple files, or an entire website.

One of the main use cases of it is saving the snapshot of an website. As a developer, this snapshot allows you to hold onto your work, to showcase it later, even if you no longer have the original source code. Moreover, you might want to avoid referencing the live site, as it could change by a different agency or developer.

## Spin up Docker

Docker allows for a consistent environment for applications to run in, regardless of the host operating system. This greatly reduces the risk of OS-related errors. Head over to [docker.com](https://docs.docker.com/get-docker/) to install it.

Open up your terminal and run the following commands:
  
```bash
docker pull ubuntu
docker run -it ubuntu
```
The `docker pull ubuntu` command will download the official Ubuntu image from the Docker hub to the local machine.

The `docker run -it ubuntu` command will start a new container using this image. The -it flag ensures that the container's terminal is attached to your current terminal, allowing you to run commands inside the container from your current terminal.

Execute the following commands to install "wget":

```bash
apt-get update
apt-get install wget
wget --version
```

## Mirror entire website

Now we have wget CLI tool, we can use it to mirror an entire website. I will mirror [vitepress.dev](https://vitepress.dev) as an example. 

However, it's important to note that if you're attempting to mirror a site built with a JavaScript framework like Next.js, "wget" might not function as anticipated. This is because such websites render their content on the client side and might not be fully captured by "wget."

All we need is to run single command with bunch of flags.

```bash
wget --recursive \
--no-clobber \
--content-disposition \
--html-extension \
--page-requisites \
--convert-links \
--restrict-file-names=windows \
--directory-prefix wget-mirror \
-e robots=off \
--span-hosts \
--domains vitepress.dev \
https://vitepress.dev
```

Let's explain some important flags in the above command:

- `--recursive`: Download the website recursively, i.e., follow all links on the website to download all the linked pages and resources.
- `--restrict-file-names=windows`: Modify file names so that they will work better on Windows systems. You can omit it if you're on a different OS.
- `--html-extension`: Append .html extension to files of type text/html. This parameter is crucial. If you omit it, the browser will download the pages when you click a link instead of routing them.
- `--page-requisites`: Download all files necessary to properly display the page, such as images, stylesheets, and scripts.
- `--convert-links`: Convert links in downloaded files to point to the local files, so that the website can be viewed offline.
- `--directory-prefix wget-mirror`: Save all files in a directory called wget-mirror.
- `--domains vitejs.dev`: Only download files from the specified domains, even if other domains are linked to in the downloaded files.

These are the params that I found most useful. You can visit [gnu.org](https://www.gnu.org/software/wget/manual/wget.html) to learn more.

## View the website offline

We'll zip the downloaded directory and copy it from the container to our machine.

Execute the following commands in the attached terminal to zip the directory:

```bash
apt-get install -y zip
zip -r wget-mirror.zip wget-mirror
```

Then, open up a new terminal in your machine (not in Docker) and execute:

```bash
docker container ls
```
Above command will log your container ids. Select the appropriate one and use it on next command.

```bash
docker cp <your-container-id>:/wget-mirror.zip .
```

You should be able to see the cloned website if you unzip the file. 

Go ahead and open the "index.html" file located in the "vitejs.dev" folder. Once you do that, you can browse the entire website. Everything should work smoothly – all the links will take you to the right places, and all the pictures and other things on the site should show up correctly. You won't need to start a local webserver to serve assets; the wget has got you covered!