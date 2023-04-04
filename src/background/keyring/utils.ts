type Base64Image = `data:image/${
  | 'png'
  | 'gif'
  | 'jpg'
  | 'jpeg'};base64${string}`

type HexColor = `#${string}`

type Avatar = Base64Image | HexColor

export type AccountMeta = {
  alias: string
  avatar: Avatar
}
