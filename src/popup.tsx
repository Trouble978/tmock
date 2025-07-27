import {
  CaretRightOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  PlusOutlined
} from "@ant-design/icons"
import { json } from "@codemirror/lang-json"
import { oneDark } from "@codemirror/theme-one-dark"
import CodeMirror from "@uiw/react-codemirror"
import {
  Button,
  Card,
  Col,
  Collapse,
  Dropdown,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Space,
  Switch,
  Tabs,
  Tag
} from "antd"
import type { CollapseProps, MenuProps, TabsProps } from "antd"

import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

type TargetKey = React.MouseEvent | React.KeyboardEvent | string

interface ParamsData {
  requestBody: string[]
  response: string
}

interface InterfaceData {
  method: string
  url: string
  status: number
  // response: string
  // requestBody: string
  time: number
  switch: boolean
  label: string
  params?: ParamsData[]
}
// 添加这个新接口
interface TabData {
  label: string
  key: string
  interfaces?: InterfaceData[] // 每个标签页包含多个接口
}
// 创建 storage 实例
const storage = new Storage()

const items: MenuProps["items"] = [
  {
    label: "POST",
    key: "1"
  },
  {
    label: "GET",
    key: "2"
  },
  {
    label: "DELETE",
    key: "3"
  },
  {
    label: "PUT",
    key: "4"
  }
]
const methodColors = {
  GET: "green",
  POST: "blue",
  PUT: "orange",
  DELETE: "red"
}
const handleMenuClick: MenuProps["onClick"] = (e) => {
  message.info("Click on menu item.")
  console.log("click", e)
}
const menuProps = {
  items,
  onClick: handleMenuClick
}

const gridStyle: React.CSSProperties = {
  width: "100%",
  height: "100px",
  textAlign: "center"
}

// 定义存储的 key
const TABS_STORAGE_KEY = "browser-extension-tabs"
const ACTIVE_TAB_KEY = "browser-extension-active-tab"
const TABS_STORAGE_GROUP = "browser-extension-tabs-group"

function IndexPopup() {
  const [items, setItems] = useStorage<TabsProps["items"]>(TABS_STORAGE_KEY, [
    {
      label: "Tab 1",
      key: "1"
    }
  ])
  const [groups, setGroups] = useStorage<TabData[]>(TABS_STORAGE_GROUP, [
    {
      label: "Tab 1",
      key: "1"
    }
  ])
  const [activeTabKey, setActiveTabKey] = useStorage<string>(
    ACTIVE_TAB_KEY,
    "1"
  )

  const add = () => {
    let labelInput = ""
    Modal.confirm({
      title: "新建标签页",
      content: (
        <Input
          placeholder="请输入标签名称"
          onChange={(e) => (labelInput = e.target.value)}
        />
      ),
      onOk: () => {
        const existingKeys = (items || []).map((item) => Number(item.key))
        const maxKey = existingKeys.length > 0 ? Math.max(...existingKeys) : 0
        const newKey = String(maxKey + 1)
        const newLabel = labelInput || `Tab ${newKey}`
        const newItems = [
          ...(items || []),
          {
            label: newLabel,
            key: newKey
          }
        ]

        const newGroups = [
          ...groups,
          {
            label: newLabel,
            key: newKey,
            interfaces: []
          }
        ]

        setGroups(newGroups)
        setItems(newItems)
        setActiveTabKey(newKey)
      }
    })
  }
  // 更新接口数据的通用函数
  const updateInterface = (
    tabKey: string,
    interfaceIndex: number,
    field: keyof InterfaceData,
    value: any
  ) => {
    setGroups((prevGroups) => {
      return prevGroups.map((group) => {
        if (group.key === tabKey) {
          const newInterfaces = [...(group.interfaces || [])]
          if (newInterfaces[interfaceIndex]) {
            newInterfaces[interfaceIndex] = {
              ...newInterfaces[interfaceIndex],
              [field]: value
            }
          }
          return {
            ...group,
            interfaces: newInterfaces
          }
        }
        return group
      })
    })
  }

  // 更新下拉菜单的函数
  const updateMethod = (
    tabKey: string,
    interfaceIndex: number,
    menuItem: any
  ) => {
    const methods = ["POST", "GET", "DELETE", "PUT"]
    const method = methods[parseInt(menuItem.key) - 1]
    updateInterface(tabKey, interfaceIndex, "method", method)
  }

  const createMenuProps = (tabKey: string, interfaceIndex: number) => ({
    items: [
      { label: "POST", key: "1" },
      { label: "GET", key: "2" },
      { label: "DELETE", key: "3" },
      { label: "PUT", key: "4" }
    ],
    onClick: (e) => updateMethod(tabKey, interfaceIndex, e)
  })

  const addInterface = () => {
    if (!items || !groups) return

    // 找到当前激活的标签页
    const currentGroup = groups.find((g) => g.key === activeTabKey)
    if (!currentGroup) {
      message.error("当前标签页不存在")
      return
    }

    // 创建新的接口数据
    const newInterface: InterfaceData = {
      method: "GET",
      url: "",
      status: 200,
      response: "",
      requestBody: "",
      label: "",
      time: 0,
      switch: true
    }
    const updatedGroup = {
      ...currentGroup,
      interfaces: [...(currentGroup.interfaces || []), newInterface]
    }
    const updatedGroups = groups.map((group) =>
      group.key === activeTabKey ? updatedGroup : group
    )
    setGroups(updatedGroups)
  }
  const switchAll = (checked: boolean) => {
    setGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.key === activeTabKey
          ? {
              ...group,
              interfaces: group.interfaces?.map((iface) => ({
                ...iface,
                switch: checked
              }))
            }
          : group
      )
    )
  }
  const remove = (targetKey: TargetKey) => {
    if (!items) return
    const newItems = items.filter((item) => item.key !== targetKey)
    setItems(newItems)
    setGroups((prevGroups) =>
      prevGroups.filter((group) => group.key !== targetKey)
    )
  }

  const onEdit = (targetKey: TargetKey, action: "add" | "remove") => {
    if (action === "add") {
      add()
    } else {
      remove(targetKey)
    }
  }

  const handleTabChange = (key: string) => {
    setActiveTabKey(key)
  }
  // 添加参数对的函数
  const addParam = (tabKey: string, interfaceIndex: number) => {
    setGroups((prevGroups) => {
      return prevGroups.map((group) => {
        if (group.key === tabKey) {
          const newInterfaces = [...(group.interfaces || [])]
          if (newInterfaces[interfaceIndex]) {
            const newParam: ParamsData = {
              requestBody: [], // 空数组，可以添加多个请求体
              response: ""
            }
            newInterfaces[interfaceIndex] = {
              ...newInterfaces[interfaceIndex],
              params: [
                ...(newInterfaces[interfaceIndex].params || []),
                newParam
              ]
            }
          }
          return {
            ...group,
            interfaces: newInterfaces
          }
        }
        return group
      })
    })
    message.success("已添加新的响应")
  }

  // 更新某个参数对的响应
  const updateParamResponse = (
    tabKey: string,
    interfaceIndex: number,
    paramIndex: number,
    response: string
  ) => {
    setGroups((prevGroups) => {
      return prevGroups.map((group) => {
        if (group.key === tabKey) {
          const newInterfaces = [...(group.interfaces || [])]
          if (newInterfaces[interfaceIndex]?.params?.[paramIndex]) {
            const newParams = [...(newInterfaces[interfaceIndex].params || [])]
            newParams[paramIndex] = {
              ...newParams[paramIndex],
              response
            }
            newInterfaces[interfaceIndex] = {
              ...newInterfaces[interfaceIndex],
              params: newParams
            }
          }
          return {
            ...group,
            interfaces: newInterfaces
          }
        }
        return group
      })
    })
  }
  // 删除接口的函数
  const deleteInterface = (tabKey: string, interfaceIndex: number) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这个接口吗？",
      okText: "确定",
      cancelText: "取消",
      onOk: () => {
        setGroups((prevGroups) => {
          return prevGroups.map((group) => {
            if (group.key === tabKey) {
              // 创建新的 interfaces 数组，移除指定索引的接口
              const newInterfaces = [...(group.interfaces || [])]
              newInterfaces.splice(interfaceIndex, 1)
              return {
                ...group,
                interfaces: newInterfaces
              }
            }
            return group
          })
        })
        message.success("接口已删除")
      }
    })
  }
  // 添加请求体到某个参数对
  const addRequestBody = (
    tabKey: string,
    interfaceIndex: number,
    paramIndex: number
  ) => {
    setGroups((prevGroups) => {
      return prevGroups.map((group) => {
        if (group.key === tabKey) {
          const newInterfaces = [...(group.interfaces || [])]
          if (newInterfaces[interfaceIndex]?.params?.[paramIndex]) {
            const newParams = [...(newInterfaces[interfaceIndex].params || [])]
            newParams[paramIndex] = {
              ...newParams[paramIndex],
              requestBody: [...newParams[paramIndex].requestBody, ""] // 添加空字符串
            }
            newInterfaces[interfaceIndex] = {
              ...newInterfaces[interfaceIndex],
              params: newParams
            }
          }
          return {
            ...group,
            interfaces: newInterfaces
          }
        }
        return group
      })
    })
  }

  // 删除某个请求体
  const deleteRequestBody = (
    tabKey: string,
    interfaceIndex: number,
    paramIndex: number,
    requestBodyIndex: number
  ) => {
    setGroups((prevGroups) => {
      return prevGroups.map((group) => {
        if (group.key === tabKey) {
          const newInterfaces = [...(group.interfaces || [])]
          if (newInterfaces[interfaceIndex]?.params?.[paramIndex]) {
            const newParams = [...(newInterfaces[interfaceIndex].params || [])]
            const newRequestBodies = [...newParams[paramIndex].requestBody]
            newRequestBodies.splice(requestBodyIndex, 1)
            newParams[paramIndex] = {
              ...newParams[paramIndex],
              requestBody: newRequestBodies
            }
            newInterfaces[interfaceIndex] = {
              ...newInterfaces[interfaceIndex],
              params: newParams
            }
          }
          return {
            ...group,
            interfaces: newInterfaces
          }
        }
        return group
      })
    })
  }

  // 删除整个参数对
  const deleteParam = (
    tabKey: string,
    interfaceIndex: number,
    paramIndex: number
  ) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这个响应配置吗？",
      okText: "确定",
      cancelText: "取消",
      onOk: () => {
        setGroups((prevGroups) => {
          return prevGroups.map((group) => {
            if (group.key === tabKey) {
              const newInterfaces = [...(group.interfaces || [])]
              if (newInterfaces[interfaceIndex]?.params) {
                const newParams = [
                  ...(newInterfaces[interfaceIndex].params || [])
                ]
                newParams.splice(paramIndex, 1)
                newInterfaces[interfaceIndex] = {
                  ...newInterfaces[interfaceIndex],
                  params: newParams
                }
              }
              return {
                ...group,
                interfaces: newInterfaces
              }
            }
            return group
          })
        })
        message.success("已删除响应配置")
      }
    })
  }

  // 更新某个请求体
  const updateRequestBody = (
    tabKey: string,
    interfaceIndex: number,
    paramIndex: number,
    requestBodyIndex: number,
    value: string
  ) => {
    setGroups((prevGroups) => {
      return prevGroups.map((group) => {
        if (group.key === tabKey) {
          const newInterfaces = [...(group.interfaces || [])]
          if (newInterfaces[interfaceIndex]?.params?.[paramIndex]) {
            const newParams = [...(newInterfaces[interfaceIndex].params || [])]
            const newRequestBodies = [...newParams[paramIndex].requestBody]
            newRequestBodies[requestBodyIndex] = value
            newParams[paramIndex] = {
              ...newParams[paramIndex],
              requestBody: newRequestBodies
            }
            newInterfaces[interfaceIndex] = {
              ...newInterfaces[interfaceIndex],
              params: newParams
            }
          }
          return {
            ...group,
            interfaces: newInterfaces
          }
        }
        return group
      })
    })
  }
  // 首先找到当前激活的标签页数据
  const currentGroup = groups.find((g) => g.key === activeTabKey)
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16,
        height: "fit-content",
        minHeight: "800px",
        width: "600px"
      }}>
      <Tabs
        type="editable-card"
        size="middle"
        activeKey={activeTabKey}
        onChange={handleTabChange}
        onEdit={onEdit}
        items={items}
      />
      {groups.length > 0 && (
        <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            defaultChecked
            onChange={switchAll}></Switch>
          <Button
            type="primary"
            shape="circle"
            onClick={addInterface}
            size="small">
            <PlusOutlined />
          </Button>
        </div>
      )}
      {currentGroup?.interfaces &&
        currentGroup.interfaces.map((iface, index) => {
          const CardData = (
            <div
              key={`interface-${currentGroup.key}-${index}`}
              style={{
                marginTop: "10px"
              }}>
              <Card style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "10px"
                  }}>
                  <Input
                    value={iface.url || "https://www.antdv.com/"}
                    onChange={(e) =>
                      updateInterface(
                        currentGroup.key,
                        index,
                        "url",
                        e.target.value
                      )
                    }
                    style={{ width: "480px" }}
                  />
                  <Dropdown menu={createMenuProps(currentGroup.key, index)}>
                    <Button>
                      <Space>
                        {iface.method || "GET"}
                        <DownOutlined />
                      </Space>
                    </Button>
                  </Dropdown>
                </div>
                <Row>
                  <Col span={3}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        height: "100%"
                      }}>
                      状态码：
                    </div>
                  </Col>
                  <Col span={5}>
                    <InputNumber
                      min={0}
                      max={999}
                      value={iface.status || 200}
                      onChange={(value) =>
                        updateInterface(
                          currentGroup.key,
                          index,
                          "status",
                          value
                        )
                      }
                    />
                  </Col>
                  <Col span={2}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        height: "100%"
                      }}>
                      延时：
                    </div>
                  </Col>
                  <Col span={4}>
                    <InputNumber
                      min={0}
                      max={10000}
                      value={iface.time || 0}
                      onChange={(value) =>
                        updateInterface(currentGroup.key, index, "time", value)
                      }
                      addonAfter="ms"
                    />
                  </Col>
                  <Col span={2}></Col>
                  <Col span={2}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        height: "100%"
                      }}>
                      开关：
                    </div>
                  </Col>
                  <Col span={5}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        height: "100%"
                      }}>
                      <Switch
                        checked={iface.switch !== false}
                        onChange={(checked) =>
                          updateInterface(
                            currentGroup.key,
                            index,
                            "switch",
                            checked
                          )
                        }
                      />
                    </div>
                  </Col>
                </Row>
                <Row style={{ marginTop: "10px" }}>
                  <Col span={3}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        height: "100%"
                      }}>
                      描述：
                    </div>
                  </Col>
                  <Col span={11}>
                    <Input
                      value={iface.label || "接口详细"}
                      onChange={(e) =>
                        updateInterface(
                          currentGroup.key,
                          index,
                          "label",
                          e.target.value
                        )
                      }
                    />
                  </Col>
                  <Col span={2}></Col>
                  <Col span={2}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        height: "100%"
                      }}>
                      删除：
                    </div>
                  </Col>

                  <Col span={5}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        height: "100%"
                      }}>
                      <Button
                        danger
                        onClick={() =>
                          deleteInterface(currentGroup.key, index)
                        }>
                        <DeleteOutlined />
                      </Button>
                    </div>
                  </Col>
                </Row>
                <div
                  style={{
                    border: "1px solid #ddd",
                    padding: "10px 20px",
                    marginTop: "10px"
                  }}>
                  {/* 显示已有的参数对 */}
                  {iface.params && iface.params.length > 0 ? (
                    iface.params.map((param, paramIndex) => (
                      <div
                        key={paramIndex}
                        style={{
                          marginBottom: 20,
                          borderBottom: "1px solid #eee",
                          paddingBottom: 20
                        }}>
                        <div
                          style={{
                            marginBottom: 10,
                            fontWeight: 500,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}>
                          <span>响应配置 {paramIndex + 1}</span>
                          <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() =>
                              deleteParam(currentGroup.key, index, paramIndex)
                            }
                          />
                        </div>
                        <div style={{ display: "flex", gap: 20 }}>
                          <div style={{ width: "50%", height: "fit-content" }}>
                            <div style={{ marginBottom: 8, fontWeight: 500 }}>
                              请求体列表
                            </div>
                            <div
                              style={{
                                height: "fit-content",
                                overflowY: "auto"
                              }}>
                              {param.requestBody.length > 0 ? (
                                param.requestBody.map((body, bodyIndex) => (
                                  <div
                                    key={bodyIndex}
                                    style={{
                                      marginBottom: 10,
                                      borderTop: "1px solid #e8e8e8",
                                      padding: 0
                                    }}>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        marginBottom: 4
                                      }}>
                                      <Button
                                        danger
                                        size="small"
                                        type="text"
                                        icon={<DeleteOutlined />}
                                        onClick={() =>
                                          deleteRequestBody(
                                            currentGroup.key,
                                            index,
                                            paramIndex,
                                            bodyIndex
                                          )
                                        }
                                      />
                                    </div>
                                    <CodeMirror
                                      value={body}
                                      height="100px"
                                      theme={oneDark}
                                      extensions={[json()]}
                                      onChange={(value) =>
                                        updateRequestBody(
                                          currentGroup.key,
                                          index,
                                          paramIndex,
                                          bodyIndex,
                                          value
                                        )
                                      }
                                      placeholder="输入 JSON 格式的请求体"
                                    />
                                  </div>
                                ))
                              ) : (
                                <div
                                  style={{
                                    color: "#999",
                                    textAlign: "center",
                                    padding: 20
                                  }}>
                                  暂无请求体
                                </div>
                              )}
                            </div>
                            <Button
                              size="small"
                              style={{ marginTop: 8, width: "100%" }}
                              onClick={() =>
                                addRequestBody(
                                  currentGroup.key,
                                  index,
                                  paramIndex
                                )
                              }>
                              添加请求体
                            </Button>
                          </div>
                          <div style={{ width: "50%" }}>
                            <div style={{ marginBottom: 8, fontWeight: 500 }}>
                              响应内容
                            </div>
                            <CodeMirror
                              value={param.response || ""}
                              height={`${Math.max(
                                150, // 最小高度
                                param.requestBody.length > 0
                                  ? param.requestBody.length * 140 // 每个请求体 100px + padding 8*2 + border 2 + 删除按钮区域 28 = 146px，间距 10px
                                  : 150
                              )}px`}
                              theme={oneDark}
                              extensions={[json()]}
                              onChange={(value) =>
                                updateParamResponse(
                                  currentGroup.key,
                                  index,
                                  paramIndex,
                                  value
                                )
                              }
                              placeholder="输入 JSON 格式的响应内容"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: 20,
                        color: "#999"
                      }}>
                      暂无响应配置，点击下方按钮添加
                    </div>
                  )}

                  <Button
                    type="primary"
                    onClick={() => addParam(currentGroup.key, index)}
                    style={{ marginTop: 10 }}>
                    添加响应配置
                  </Button>
                </div>
              </Card>
            </div>
          )
          const items: CollapseProps["items"] = [
            {
              key: index,
              label: (
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      width: "150px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                    {iface.label || "接口详细"}
                  </div>
                  <Tag
                    color={methodColors[iface.method] || "default"}
                    style={{ width: "45px" }}>
                    {iface.method || "GET"}
                  </Tag>
                  <div
                    style={{
                      width: "150px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                    {iface.url || "未设置URL"}
                  </div>
                  {iface.switch && <Tag color="success">已启用</Tag>}
                </div>
              ),
              children: CardData
            }
          ]
          return (
            <Collapse
              items={items}
              bordered={false}
              defaultActiveKey={[]}
              style={{ borderRadius: "0px", marginTop: "5px" }}
              expandIcon={({ isActive }) => (
                <CaretRightOutlined rotate={isActive ? 90 : 0} />
              )}></Collapse>
          )
        })}
    </div>
  )
}

export default IndexPopup
