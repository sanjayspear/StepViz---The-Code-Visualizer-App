#!/bin/sh
# Rebuild the expected outputs in tests/golden from the real compilers (javac/java, clang++, clang).
# Run this after adding a program; the .out files are the reference StepViz must match exactly.
# Avoid things whose output depends on the library (unordered containers, sort ties, heap layouts).
set -eu
cd "$(dirname "$0")/../tests/golden"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
mkdir -p "$tmp/java" "$tmp/cpp" "$tmp/c"
fail() { echo "golden-refresh: $1 failed" >&2; exit 1; }
for f in java/*.java; do
  n=$(basename "$f" .java); mkdir -p "$tmp/java/$n"; cp "$f" "$tmp/java/$n/Main.java"
  in=/dev/null; [ -f "java/$n.in" ] && in="$PWD/java/$n.in"
  (cd "$tmp/java/$n" && javac Main.java && java Main < "$in") > "java/$n.out" || fail "java/$n"
done
for f in cpp/*.cpp; do
  n=$(basename "$f" .cpp); in=/dev/null; [ -f "cpp/$n.in" ] && in="cpp/$n.in"
  clang++ -std=c++17 -w -o "$tmp/cpp/$n" "$f" || fail "cpp/$n (compile)"
  "$tmp/cpp/$n" < "$in" > "cpp/$n.out" || fail "cpp/$n (run)"
done
for f in c/*.c; do
  n=$(basename "$f" .c); in=/dev/null; [ -f "c/$n.in" ] && in="c/$n.in"
  clang -std=c11 -w -o "$tmp/c/$n" "$f" -lm || fail "c/$n (compile)"
  "$tmp/c/$n" < "$in" > "c/$n.out" || fail "c/$n (run)"
done
echo "golden outputs refreshed"
