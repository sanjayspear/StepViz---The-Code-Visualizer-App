#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
#include <map>
#include <set>
#include <algorithm>
#include <cmath>
using namespace std;

int sum(int a[], int n) {
    int s = 0;
    for (int i = 0; i < n; i++) s += a[i];
    return s;
}

void doubleAll(vector<int>& v) {
    for (int& x : v) x *= 2;
}

int main() {
    int x = 5;
    int& r = x;
    r += 10;
    int* p = &x;
    *p *= 2;
    cout << x << " " << r << " " << *p << endl;
    int arr[] = {1, 2, 3, 4};
    cout << sum(arr, 4) << " " << *(arr + 2) << endl;
    vector<int> v = {1, 2, 3};
    doubleAll(v);
    cout << v[0] << v[1] << v[2] << endl;
    return 0;
}
