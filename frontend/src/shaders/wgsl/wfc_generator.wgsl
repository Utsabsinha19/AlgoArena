// src/shaders/wgsl/wfc_generator.wgsl

struct WFCParams {
  gridSizeX: u32,
  gridSizeY: u32,
  gridSizeZ: u32,
  numTileTypes: u32,
  entropySeed: u32,
};

@group(0) @binding(0) var<uniform> params: WFCParams;
@group(0) @binding(1) var<storage, read_write> waveStateBuffer: array<u32>;
@group(0) @binding(2) var<storage, read_write> collapsedGrid: array<u32>;

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let x = global_id.x;
  let y = global_id.y;
  let z = global_id.z;

  if (x >= params.gridSizeX || y >= params.gridSizeY || z >= params.gridSizeZ) {
    return;
  }

  let index = z * (params.gridSizeX * params.gridSizeY) + y * params.gridSizeX + x;

  if (waveStateBuffer[index] == 0u) {
    waveStateBuffer[index] = (1u << params.numTileTypes) - 1u;
  }

  let validTiles = waveStateBuffer[index];
  let remainingCount = countOneBits(validTiles);

  if (remainingCount == 1u) {
    collapsedGrid[index] = firstTrailingBit(validTiles);
  }
}

fn countOneBits(mask: u32) -> u32 {
  var count = 0u;
  var temp = mask;
  while (temp > 0u) {
    count = count + (temp & 1u);
    temp = temp >> 1u;
  }
  return count;
}

fn firstTrailingBit(mask: u32) -> u32 {
  var pos = 0u;
  var temp = mask;
  while ((temp & 1u) == 0u && pos < 32u) {
    pos = pos + 1u;
    temp = temp >> 1u;
  }
  return pos;
}
