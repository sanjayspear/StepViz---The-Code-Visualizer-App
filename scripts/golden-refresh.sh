#!/bin/sh
# Rebuild the expected outputs in tests/golden from the real compilers (javac/java, clang++, clang).
# Run this after adding a program; the .out files are the reference StepViz must match exactly.
# Avoid things whose output depends on the library (unordered containers, sort ties, heap layouts).
set -e
cd "$(dirname "$0")/../tests/golden"
tmp=$(mktemp -d)
for f in java/*.java; do
  n=$(basename "$f" .java); mkdir -p "$tmp/$n"; cp "$f" "$tmp/$n/Main.java"
  in=/dev/null; [ -f "java/$n.in" ] && in="$PWD/java/$n.in"
  (cd "$tmp/$n" && javac Main.java && java Main < "$in") > "java/$n.out"
done
for f in cpp/*.cpp; do
  n=$(basename "$f" .cpp); in=/dev/null; [ -f "cpp/$n.in" ] && in="cpp/$n.in"
  clang++ -std=c++17 -w -o "$tmp/$n" "$f" && "$tmp/$n" < "$in" > "cpp/$n.out"
done
for f in c/*.c; do
  n=$(basename "$f" .c); in=/dev/null; [ -f "c/$n.in" ] && in="c/$n.in"
  clang -std=c11 -w -o "$tmp/c_$n" "$f" -lm && "$tmp/c_$n" < "$in" > "c/$n.out"
done
rm -rf "$tmp"
echo "golden outputs refreshed"
