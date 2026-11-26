// C reference solutions for Practice: strings (the questions that fit C). Never shipped to students.
const file = (functions: string) => `#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>
#include <ctype.h>

${functions}
int main() {
    return 0;
}
`;

export const SOLUTIONS: Record<number, string> = {
  27: file(`bool isPalindromeText(char s[]) {
    int i = 0;
    int j = strlen(s) - 1;
    while (i < j) {
        if (!isalpha(s[i])) i++;
        else if (!isalpha(s[j])) j--;
        else {
            if (tolower(s[i]) != tolower(s[j])) return false;
            i++;
            j--;
        }
    }
    return true;
}
`),
  33: file(`bool areAnagrams(char a[], char b[]) {
    int counts[128];
    for (int i = 0; i < 128; i++) counts[i] = 0;
    for (int i = 0; a[i] != '\\0'; i++) counts[a[i]]++;
    for (int i = 0; b[i] != '\\0'; i++) counts[b[i]]--;
    for (int i = 0; i < 128; i++) {
        if (counts[i] != 0) return false;
    }
    return true;
}
`),
  37: file(`bool allUnique(char s[]) {
    int n = strlen(s);
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (s[i] == s[j]) return false;
        }
    }
    return true;
}
`),
  39: file(`int countWords(char s[]) {
    int count = 0;
    for (int i = 0; s[i] != '\\0'; i++) {
        if (s[i] != ' ' && (i == 0 || s[i - 1] == ' ')) count++;
    }
    return count;
}
`),
  40: file(`bool isRotation(char a[], char b[]) {
    int n = strlen(a);
    if (n != strlen(b)) return false;
    if (n == 0) return true;
    for (int k = 0; k < n; k++) {
        bool same = true;
        for (int i = 0; i < n; i++) {
            if (b[i] != a[(i + k) % n]) {
                same = false;
                break;
            }
        }
        if (same) return true;
    }
    return false;
}
`),
  44: file(`bool isPangram(char s[]) {
    bool seen[26];
    for (int i = 0; i < 26; i++) seen[i] = false;
    for (int i = 0; s[i] != '\\0'; i++) {
        if (isalpha(s[i])) seen[tolower(s[i]) - 'a'] = true;
    }
    for (int i = 0; i < 26; i++) {
        if (!seen[i]) return false;
    }
    return true;
}
`),
  45: file(`bool isSubsequence(char a[], char b[]) {
    int i = 0;
    for (int j = 0; b[j] != '\\0' && a[i] != '\\0'; j++) {
        if (a[i] == b[j]) i++;
    }
    return a[i] == '\\0';
}
`),
  46: file(`int findIndex(char text[], char word[]) {
    int n = strlen(text);
    int m = strlen(word);
    for (int i = 0; i + m <= n; i++) {
        int k = 0;
        while (k < m && text[i + k] == word[k]) k++;
        if (k == m) return i;
    }
    return -1;
}
`),
  48: file(`int myAtoi(char s[]) {
    int i = 0;
    while (s[i] == ' ') i++;
    int sign = 1;
    if (s[i] == '+' || s[i] == '-') {
        if (s[i] == '-') sign = -1;
        i++;
    }
    long long value = 0;
    while (isdigit(s[i])) {
        value = value * 10 + (s[i] - '0');
        if (sign * value > INT_MAX) return INT_MAX;
        if (sign * value < INT_MIN) return INT_MIN;
        i++;
    }
    return (int) (sign * value);
}
`),
  51: file(`int minDeletionsToAnagram(char a[], char b[]) {
    int counts[128];
    for (int i = 0; i < 128; i++) counts[i] = 0;
    for (int i = 0; a[i] != '\\0'; i++) counts[a[i]]++;
    for (int i = 0; b[i] != '\\0'; i++) counts[b[i]]--;
    int total = 0;
    for (int i = 0; i < 128; i++) total += abs(counts[i]);
    return total;
}
`),
  52: file(`bool oneEditAway(char a[], char b[]) {
    int n = strlen(a);
    int m = strlen(b);
    if (abs(n - m) > 1) return false;
    int i = 0;
    int j = 0;
    bool edited = false;
    while (i < n && j < m) {
        if (a[i] == b[j]) {
            i++;
            j++;
            continue;
        }
        if (edited) return false;
        edited = true;
        if (n > m) i++;
        else if (m > n) j++;
        else {
            i++;
            j++;
        }
    }
    // What is left over at the end of the longer text is one more edit.
    if (i < n || j < m) {
        if (edited) return false;
        edited = true;
    }
    return edited;
}
`),
};
