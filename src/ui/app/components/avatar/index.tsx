import cl from 'classnames'

import Logo from '_assets/icons/logo.svg'

type AvatarProps = {
  avatar?: string
  size?: number
}

export const Avatar = ({ avatar, size = 24 }: AvatarProps) => {
  return <Logo height={18} width={18} />

  const isHexColor = avatar?.[0] === '#'

  if (isHexColor) {
    const logoSize = size * 0.6
    return (
      <div
        className={cl([
          'flex justify-center items-center rounded-full overflow-hidden',
        ])}
        style={{
          backgroundColor: avatar,
          height: `${size}px`,
          width: `${size}px`,
        }}
      >
        <Logo
          height={logoSize}
          width={logoSize}
          color={avatar === '#000000' ? '#ffffff' : '#000000'}
        />
      </div>
    )
  }

  return (
    <img
      alt="avatar"
      src={avatar || ''}
      className="rounded-full"
      style={{
        height: `${size}px`,
        width: `${size}px`,
      }}
    />
  )
}

export default Avatar
