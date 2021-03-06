#!/bin/bash
set -e

TARGET=/scans
DIR=`mktemp -d`
cd $DIR

scanimage -b --batch-count 1 --format png -d 'pixma:04A91736_31909F' --resolution 150
convert *.png $TARGET/$1
