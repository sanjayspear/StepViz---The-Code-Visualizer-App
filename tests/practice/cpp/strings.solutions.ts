// C++ reference solutions for Practice: Strings. Never shipped to students.
const file = (functions: string) => `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <map>
#include <set>
using namespace std;

${functions}
int main() {
    return 0;
}
`;

export const SOLUTIONS: Record<number, string> = {
  26: file(`string reverseString(string s) {
    string out = "";
    for (int i = s.size() - 1; i >= 0; i--) out += s[i];
    return out;
}
`),
  27: file(`bool isPalindromeText(string s) {
    string letters = "";
    for (char c : s) {
        if (isalpha(c)) letters += char(tolower(c));
    }
    int i = 0;
    int j = letters.size() - 1;
    while (i < j) {
        if (letters[i] != letters[j]) return false;
        i++;
        j--;
    }
    return true;
}
`),
  28: file(`vector<int> countVowelsConsonants(string s) {
    int vowels = 0;
    int consonants = 0;
    string v = "aeiou";
    for (char c : s) {
        if (!isalpha(c)) continue;
        char low = tolower(c);
        if (v.find(low) != string::npos) vowels++;
        else consonants++;
    }
    vector<int> out;
    out.push_back(vowels);
    out.push_back(consonants);
    return out;
}
`),
  29: file(`map<char, int> charFrequency(string s) {
    map<char, int> counts;
    for (char c : s) counts[c]++;
    return counts;
}
`),
  30: file(`string firstNonRepeating(string s) {
    map<char, int> counts;
    for (char c : s) counts[c]++;
    for (char c : s) {
        if (counts[c] == 1) return string(1, c);
    }
    return "";
}
`),
  31: file(`string firstRepeating(string s) {
    set<char> seen;
    for (char c : s) {
        if (seen.count(c)) return string(1, c);
        seen.insert(c);
    }
    return "";
}
`),
  32: file(`string removeDuplicates(string s) {
    set<char> seen;
    string out = "";
    for (char c : s) {
        if (!seen.count(c)) {
            seen.insert(c);
            out += c;
        }
    }
    return out;
}
`),
  33: file(`bool areAnagrams(string a, string b) {
    if (a.size() != b.size()) return false;
    map<char, int> counts;
    for (char c : a) counts[c]++;
    for (char c : b) {
        if (counts[c] == 0) return false;
        counts[c]--;
    }
    return true;
}
`),
  34: file(`string reverseWords(string sentence) {
    vector<string> words;
    string word = "";
    for (char c : sentence) {
        if (c == ' ') {
            if (!word.empty()) words.push_back(word);
            word = "";
        } else {
            word += c;
        }
    }
    if (!word.empty()) words.push_back(word);
    string out = "";
    for (int i = words.size() - 1; i >= 0; i--) {
        if (!out.empty()) out += " ";
        out += words[i];
    }
    return out;
}
`),
  35: file(`string reverseEachWord(string sentence) {
    string out = "";
    string word = "";
    for (char c : sentence) {
        if (c == ' ') {
            out += word + " ";
            word = "";
        } else {
            word = c + word;
        }
    }
    return out + word;
}
`),
  36: file(`string capitalizeWords(string sentence) {
    string out = "";
    for (int i = 0; i < sentence.size(); i++) {
        char c = sentence[i];
        if (i == 0 || sentence[i - 1] == ' ') out += char(toupper(c));
        else out += c;
    }
    return out;
}
`),
  37: file(`bool allUnique(string s) {
    for (int i = 0; i < s.size(); i++) {
        for (int j = i + 1; j < s.size(); j++) {
            if (s[i] == s[j]) return false;
        }
    }
    return true;
}
`),
  38: file(`string longestWord(string sentence) {
    string best = "";
    string word = "";
    for (char c : sentence) {
        if (c == ' ') {
            if (word.size() > best.size()) best = word;
            word = "";
        } else {
            word += c;
        }
    }
    if (word.size() > best.size()) best = word;
    return best;
}
`),
  39: file(`int countWords(string s) {
    int count = 0;
    for (int i = 0; i < s.size(); i++) {
        if (s[i] != ' ' && (i == 0 || s[i - 1] == ' ')) count++;
    }
    return count;
}
`),
  40: file(`bool isRotation(string a, string b) {
    return a.size() == b.size() && (a + a).find(b) != string::npos;
}
`),
  41: file(`string compress(string s) {
    string out = "";
    int i = 0;
    while (i < s.size()) {
        int j = i;
        while (j < s.size() && s[j] == s[i]) j++;
        out += s[i];
        out += to_string(j - i);
        i = j;
    }
    return out.size() < s.size() ? out : s;
}
`),
  42: file(`string decode(string s) {
    string out = "";
    int i = 0;
    while (i < s.size()) {
        char letter = s[i];
        i++;
        int count = 0;
        while (i < s.size() && isdigit(s[i])) {
            count = count * 10 + (s[i] - '0');
            i++;
        }
        for (int k = 0; k < count; k++) out += letter;
    }
    return out;
}
`),
  43: file(`string longestCommonPrefix(vector<string> words) {
    if (words.empty()) return "";
    string prefix = "";
    for (int i = 0; i < words[0].size(); i++) {
        char c = words[0][i];
        for (string w : words) {
            if (i >= w.size() || w[i] != c) return prefix;
        }
        prefix += c;
    }
    return prefix;
}
`),
  44: file(`bool isPangram(string s) {
    vector<bool> seen(26, false);
    for (char c : s) {
        if (isalpha(c)) seen[tolower(c) - 'a'] = true;
    }
    for (bool b : seen) {
        if (!b) return false;
    }
    return true;
}
`),
  45: file(`bool isSubsequence(string a, string b) {
    int i = 0;
    for (char c : b) {
        if (i < a.size() && a[i] == c) i++;
    }
    return i == a.size();
}
`),
  46: file(`int findIndex(string text, string word) {
    for (int i = 0; i + word.size() <= text.size(); i++) {
        int j = 0;
        while (j < word.size() && text[i + j] == word[j]) j++;
        if (j == word.size()) return i;
    }
    return -1;
}
`),
  47: file(`vector<string> permutations(string s) {
    vector<string> out;
    if (s.size() <= 1) {
        out.push_back(s);
        return out;
    }
    for (int i = 0; i < s.size(); i++) {
        string rest = s.substr(0, i) + s.substr(i + 1);
        vector<string> tails = permutations(rest);
        for (string p : tails) out.push_back(s[i] + p);
    }
    return out;
}
`),
  48: file(`int myAtoi(string s) {
    int i = 0;
    while (i < s.size() && s[i] == ' ') i++;
    int sign = 1;
    if (i < s.size() && (s[i] == '+' || s[i] == '-')) {
        if (s[i] == '-') sign = -1;
        i++;
    }
    long long value = 0;
    while (i < s.size() && isdigit(s[i])) {
        value = value * 10 + (s[i] - '0');
        if (value > 2147483648LL) break;
        i++;
    }
    value *= sign;
    if (value > 2147483647LL) return 2147483647;
    if (value < -2147483648LL) return -2147483648LL;
    return value;
}
`),
  49: file(`string longestPalindrome(string s) {
    string best = "";
    for (int c = 0; c < s.size(); c++) {
        for (int extra = 0; extra < 2; extra++) {
            int lo = c;
            int hi = c + extra;
            while (lo >= 0 && hi < s.size() && s[lo] == s[hi]) {
                lo--;
                hi++;
            }
            if (hi - lo - 1 > best.size()) best = s.substr(lo + 1, hi - lo - 1);
        }
    }
    return best;
}
`),
  50: file(`vector<vector<string>> groupAnagrams(vector<string> words) {
    map<string, int> where;
    vector<vector<string>> groups;
    for (string w : words) {
        vector<int> counts(26, 0);
        for (char c : w) counts[c - 'a']++;
        string key = "";
        for (int n : counts) key += to_string(n) + ",";
        if (where.count(key) == 0) {
            where[key] = groups.size();
            vector<string> fresh;
            groups.push_back(fresh);
        }
        groups[where[key]].push_back(w);
    }
    return groups;
}
`),
  51: file(`int minDeletionsToAnagram(string a, string b) {
    vector<int> counts(128, 0);
    for (char c : a) counts[c]++;
    for (char c : b) counts[c]--;
    int total = 0;
    for (int n : counts) total += abs(n);
    return total;
}
`),
  52: file(`bool oneEditAway(string a, string b) {
    if (a == b) return false;
    if (a.size() < b.size()) {
        string t = a;
        a = b;
        b = t;
    }
    if (a.size() - b.size() > 1) return false;
    int i = 0;
    while (i < b.size() && a[i] == b[i]) i++;
    if (a.size() == b.size()) return a.substr(i + 1) == b.substr(i + 1);
    return a.substr(i + 1) == b.substr(i);
}
`),
  53: file(`string zigzag(string s, int rows) {
    if (rows == 1) return s;
    vector<string> lines(rows, "");
    int row = 0;
    int step = 1;
    for (char c : s) {
        lines[row] += c;
        if (row == 0) step = 1;
        else if (row == rows - 1) step = -1;
        row += step;
    }
    string out = "";
    for (string line : lines) out += line;
    return out;
}
`),
  54: file(`string countAndSay(int n) {
    string term = "1";
    for (int k = 1; k < n; k++) {
        string next = "";
        int i = 0;
        while (i < term.size()) {
            int j = i;
            while (j < term.size() && term[j] == term[i]) j++;
            next += to_string(j - i);
            next += term[i];
            i = j;
        }
        term = next;
    }
    return term;
}
`),
  55: file(`string minWindow(string s, string t) {
    vector<int> need(128, 0);
    for (char c : t) need[c]++;
    int missing = t.size();
    string best = "";
    int left = 0;
    for (int right = 0; right < s.size(); right++) {
        char c = s[right];
        if (need[c] > 0) missing--;
        need[c]--;
        while (missing == 0) {
            if (best.empty() || right - left + 1 < best.size()) best = s.substr(left, right - left + 1);
            char out = s[left];
            left++;
            need[out]++;
            if (need[out] > 0) missing++;
        }
    }
    return best;
}
`),
};
