#!/bin/bash
#this is a comment-the first line sets bash as the shell script
cd "$(dirname "$0")"
python -m SimpleHTTPServer 8080;
exit;
