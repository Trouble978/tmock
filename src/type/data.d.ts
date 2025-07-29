export interface ParamsData {
  requestBody: string[]
  response: string
}

export interface InterfaceData {
  method: string
  url: string
  status: number
  time: number
  switch: boolean
  label: string
  params?: ParamsData[]
}
// 添加这个新接口
export interface TabData {
  label: string
  key: string
  interfaces?: InterfaceData[] // 每个标签页包含多个接口
}