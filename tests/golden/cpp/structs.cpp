#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
#include <algorithm>
#include <cmath>
using namespace std;

struct Point {
    int x;
    int y;
};

int dist2(const Point& p) { return p.x * p.x + p.y * p.y; }

int main() {
    Point p = {1, 2};
    Point q = p;
    q.x = 10;
    cout << p.x << " " << q.x << " " << dist2(p) << endl;
    return 0;
}
