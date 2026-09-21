struct GridUniforms {
  dimensions : vec3<u32>,
  startIdx   : u32,
  goalIdx    : u32,
  hWeight    : f32,
};

@group(0) @binding(0) var<uniform> grid : GridUniforms;
@group(0) @binding(1) var<storage, read> weights : array<f32>;
@group(0) @binding(2) var<storage, read_write> distances : array<u32>;
@group(0) @binding(3) var<storage, read_write> visited : array<u32>;
@group(0) @binding(4) var<storage, read_write> parentPointers : array<i32>;

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
  let x = global_id.x;
  let y = global_id.y;
  let z = global_id.z;

  if (x >= grid.dimensions.x || y >= grid.dimensions.y || z >= grid.dimensions.z) {
    return;
  }

  let index = z * (grid.dimensions.x * grid.dimensions.y) + y * grid.dimensions.x + x;

  if (visited[index] == 1u) {
    return;
  }

  let currentDist = distances[index];
  if (currentDist == 0xFFFFFFFFu) {
    return;
  }

  // 6-directional 3D neighbor exploration
  let neighbors = array<vec3<i32>, 6>(
    vec3<i32>(1, 0, 0), vec3<i32>(-1, 0, 0),
    vec3<i32>(0, 1, 0), vec3<i32>(0, -1, 0),
    vec3<i32>(0, 0, 1), vec3<i32>(0, 0, -1)
  );

  for (var i = 0u; i < 6u; i = i + 1u) {
    let nx = i32(x) + neighbors[i].x;
    let ny = i32(y) + neighbors[i].y;
    let nz = i32(z) + neighbors[i].z;

    if (nx >= 0 && nx < i32(grid.dimensions.x) &&
        ny >= 0 && ny < i32(grid.dimensions.y) &&
        nz >= 0 && nz < i32(grid.dimensions.z)) {

      let neighborIdx = u32(nz) * (grid.dimensions.x * grid.dimensions.y) + u32(ny) * grid.dimensions.x + u32(nx);
      let weight = weights[neighborIdx];

      if (weight < 1000000.0) {
        let newDist = currentDist + u32(weight);
        if (newDist < distances[neighborIdx]) {
          atomicMin(&distances[neighborIdx], newDist);
          parentPointers[neighborIdx] = i32(index);
        }
      }
    }
  }
}
