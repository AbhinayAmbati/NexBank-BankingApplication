const HeaderBox = ({
    type="title",
    title,
    user,
    subtext
}: HeaderBoxProps) => {
  return (
    <div className="header-box">
      <div className="header-box-title">
        <h1>{title}
            {type === "greeting" && <span className="text-bankGradient">
                &nbsp;{user}</span>}
        </h1>
        <p className="header-box-subtext">{subtext}</p>
      </div>
    </div>
  )
}

export default HeaderBox;
