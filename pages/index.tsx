import { NextPage, GetServerSideProps } from "next";
import { useEffect, useState } from 'react'
import styles from './index.module.css'

// getServerSidePropsから渡されるpropsの型
type Props = {
  initialImageUrl: string
}

// ページコンポーネント関数にpropsを受け取る引数を追加する
const IndexPage: NextPage<Props> = ({ initialImageUrl }) => {
  // useStateを使って状態を管理
  const [imageUrl, setImageUrl] = useState(initialImageUrl)
  const [loading, setLoading] = useState(true)
  // マウント時に画像を読み込む宣言
  useEffect(() => {
    fetchImage().then((newImage) => {
      setImageUrl(newImage.url)
      setLoading(false)
    })
  }, [])
  
  // ボタンをクリックしたときに画像を読み込む処理
  const handleClick = async () => {
    setLoading(true)
    const newImage = await fetchImage()
    setImageUrl(newImage.url)
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <button className={styles.button} onClick={handleClick}>one more cat!</button>
      <div className={styles.img}>
        {loading || <img src={imageUrl}/>}
      </div>
    </div>
    )
}
export default IndexPage

// サーバサイドで実行される処理
export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const image = await fetchImage()
  return {
    props: {
      initialImageUrl: image.url
    }
  }
}

type Image = {
  url: string
}

const fetchImage = async (): Promise<Image> => {
  const res = await fetch("https://api.thecatapi.com/v1/images/search")
  const images: unknown = await res.json()
  // 配列として表現されているか
  if (!Array.isArray(images)) {
    throw new Error('猫の画像が取得できませんでした')
  }
  const image: unknown = images[0]
  // imageの構造をなしているか
  if (!isImage(image)) {
    throw new Error('猫の画像を取得できませんでした。')
  }
  return image
}

fetchImage().then((image) => {
  console.log(image)
})

// 型ガード関数
const isImage = (value: unknown): value is Image => {
  // 値がオブジェクトか
  if (!value || typeof value !== 'object') {
    return false
  }
  // urlプロパティが存在し、かつ、それが文字列か
  return 'url' in value && typeof value.url === 'string'
}