#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
#include <algorithm>
#include <cmath>
using namespace std;

int main() {
    vector<int> v = {5, 3, 8, 1};
    v.push_back(7);
    v.pop_back();
    sort(v.begin(), v.end());
    cout << v.size() << " " << v[0] << " " << v.back() << " " << v.front() << endl;
    vector<int> w(3, 9);
    w.insert(w.begin() + 1, 4);
    w.erase(w.begin());
    for (int x : w) cout << x << " ";
    cout << endl;
    swap(v[0], v[3]);
    cout << v[0] << v[3] << " " << max(3, 9) << min(2.5, 1.5) << endl;
    return 0;
}
