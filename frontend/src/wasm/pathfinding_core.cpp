// ============================================================================
// AlgoArena v5.0 - WebAssembly (WASM) C++ Kernel Core (Section 1)
// Microsecond SIMD-accelerated 8-directional graph search kernel compiled via Emscripten
// ============================================================================

#include <emscripten/emscripten.h>
#include <vector>
#include <queue>
#include <cmath>
#include <algorithm>

struct Node {
    int x, y;
    float g, h;
    int parentIndex;
    bool operator>(const Node& other) const { return (g + h) > (other.g + other.h); }
};

extern "C" {

EMSCRIPTEN_KEEPALIVE
int run_wasm_astar(
    const uint8_t* grid, int width, int height,
    int startX, int startY, int goalX, int goalY,
    int* outPathX, int* outPathY, int maxPathLen,
    float heuristicWeight
) {
    int totalCells = width * height;
    std::vector<float> gScore(totalCells, 1e9f);
    std::vector<int> parent(totalCells, -1);
    std::vector<bool> visited(totalCells, false);

    std::priority_queue<Node, std::vector<Node>, std::greater<Node>> openSet;

    int startIndex = startY * width + startX;
    int goalIndex = goalY * width + goalX;

    gScore[startIndex] = 0.0f;
    openSet.push({startX, startY, 0.0f, static_cast<float>(std::abs(startX - goalX) + std::abs(startY - goalY)), -1});

    int nodesExplored = 0;

    while (!openSet.empty()) {
        Node curr = openSet.top();
        openSet.pop();

        int currIndex = curr.y * width + curr.x;
        if (visited[currIndex]) continue;
        visited[currIndex] = true;
        nodesExplored++;

        if (curr.x == goalX && curr.y == goalY) break;

        static const int dx[] = {0, 1, 0, -1, 1, 1, -1, -1};
        static const int dy[] = {-1, 0, 1, 0, -1, 1, 1, -1};

        for (int i = 0; i < 8; ++i) {
            int nx = curr.x + dx[i];
            int ny = curr.y + dy[i];

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                int nIndex = ny * width + nx;
                if (grid[nIndex] == 1) continue; // Obstacle

                float stepCost = (i < 4) ? 1.0f : 1.414f; // Diagonal movement
                float newG = gScore[currIndex] + stepCost;

                if (newG < gScore[nIndex]) {
                    gScore[nIndex] = newG;
                    parent[nIndex] = currIndex;
                    float h = static_cast<float>(std::abs(nx - goalX) + std::abs(ny - goalY)) * heuristicWeight;
                    openSet.push({nx, ny, newG, h, currIndex});
                }
            }
        }
    }

    // Reconstruction
    int curr = goalIndex;
    int pathLen = 0;
    while (curr != -1 && pathLen < maxPathLen) {
        outPathX[pathLen] = curr % width;
        outPathY[pathLen] = curr / width;
        curr = parent[curr];
        pathLen++;
    }

    return pathLen;
}

}
