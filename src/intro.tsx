
import { Layout, Button, Input, Typography, Row, Col, Space, Drawer, Skeleton, notification, Divider } from 'antd';
import { openNotification, closeNotification } from "./notification";
import './intro.css'
import deepEqual from "deep-equal";
const { Header, Footer, Sider, Content } = Layout;
const { Text, Link, Title } = Typography;


const Intro = () => {
    return (<>
        <div className="intro-notice">
            <Title level={4}>ご報告</Title>
            <Title level={3}><span className="intro-name">ソロキャン</span> は この春、</Title>
            <Title><span className="line">Splannt：スプラント</span> に生まれ変わります！</Title>
            <Space direction="vertical" className="notice-detail">
                <Text>約2週間のMVP実施後ソロキャンは法人化し、<Link href="https://branchism.com/">株式会社Branchism</Link>となりました。</Text>
                <Text>ソロキャンでは実現できなかった「本人確認」「いいね・ブロック」「通知」ができるようになります！</Text>
                <Text>これからも安心・安全な待ち合わせサービス実現に尽くしていきますので応援よろしくお願い致します！</Text>
            </Space>
            <Title level={4}>Twitter始めました！↓↓</Title>

            <div className="notice-btn">
                <Button href="https://twitter.com/Branchism_corp" type="primary" shape="round" size={'large'}>
                    @Branchism_corp
                </Button>
            </div>
            <Title level={4}>Splanntの情報をいち早くお届けします！↓↓</Title>
            <div className="notice-btn">
                <Button href="https://forms.gle/AUXxvttFgbEKqtAe7" type="primary" shape="round" size={'large'} danger>
                    事前登録する
                </Button>
            </div>
        </div>
        <Space direction="vertical" size={35} id="intro">
            <div className="intro-title">
                <Title level={3}>その時、その場所かぎりの出会いを探す。</Title>
                <Title><span className="intro-name">ソロキャン[ SOLO - Campus ] (β版)</span> は<br /><span className="line">時間ベース</span> の <span className="line">会える</span> 新しいソーシャルネットワーキングサービスです。</Title>
            </div>
            <div className="intro-bg">
                <Title level={3}>利用方法</Title>
                <Space direction="vertical" className="intro-num">
                    <Text>1. 空いてる時間を決める</Text>
                    <Text>2. マッチングできたらお互い承認する</Text>
                    <Text>3. 相手とチャットで当日何するか決める</Text>
                    <Text>4. 指定された日時と場所で会う</Text>
                </Space>
            </div>
            <div className="intro-bg">
                <Title level={3}>仕組み</Title>
                <Space direction="vertical" className="intro-dot">
                    <Text>同じ時間が空いているかつ指定場所がお互い2km以内のユーザー同士がマッチングできます。</Text>
                    <Text>男女関係なく完全ランダム制</Text>
                    <Text>どちらかの指定した位置が待ち合わせ場所にランダムで選ばれます。</Text>
                    <Text>現在は一回３０分に制限しています。</Text>
                    <Text>過去のチャット欄みは観覧できなくなります。</Text>
                </Space>
            </div>
            <div className="intro-bg">
                <Title level={3}>何で作ったの？</Title>
                <Space direction="vertical" className="intro-dot">
                    <Text>広いキャンパス内なのにどうしても同じ友達ばかり絡んでしまう</Text>
                    <Text>いろんな人と話したいけど接点がない</Text>
                    <Text>そのような同士と会えるアプリを作りたい</Text>
                </Space>
            </div>
            <div className="center" ><Text >というのは建前で・・</Text></div>
            <div className="intro-bg">
                <div className="intro-sm">
                    <Title level={4}>実は <span className="line">大学生</span> ってこんな人が多いんです。</Title>
                    <Space direction="vertical" className="intro-tri">
                        <Text>授業がない日は一日中家にいる</Text>
                        <Text>ベットの上でだらだらしててご飯も食べるのも面倒になってくる</Text>
                        <Text>生活リズムという存在がなく、健康的にもやばいし心が暗くなる</Text>
                    </Space>
                </div>
                <div className="intro-sm">
                    <Title level={4}>でも、そんな私にも新しい発見がありました。</Title>
                    <Space direction="vertical" className="intro-tri">
                        <Text>インターンで朝礼があったり予定がある日はすごく規則的な生活してる！ご飯３食！ちゃんと机の前で仕事できてる！</Text>
                        <Text>なので今の生活を改善するには1日一回は人と会う約束するのが自分にとって有効だと思いました</Text>
                    </Space>
                </div>
            </div>
            <div className="center" ><Text >したがって『ただ外に出る口実がほしい』人を支える、そんなサービスです。</Text></div>
            <div className="intro-bg">
                <Title level={3}>会ったら何をすればいいの？</Title>
                <Space direction="vertical" className="intro-dot">
                    <Text>趣味の話・世間話・報告、なんでもあり。事前にトピックを話し合ってもOK</Text>
                    <Text>立ち話またはご飯食べながら、ボーリングをしながらでもOK</Text>
                </Space>
            </div>
            <div className="intro-bg">
                <Title level={3}>将来的には</Title>
                <Space direction="vertical" className="intro-dot">
                    <Text>県外出張した時の空いてる時間に現地の人と会ってみたいとき</Text>
                    <Text>同じトピック（ゲーム・趣味・技術）でパッと話したいとき</Text>
                    <Text>人間関係のしがらみなしで誰かと会いたいとき</Text>
                </Space>
            </div>
            <div className="center" ><Text >とかに使えるサービスになったらいいな〜とゆるく考えています。</Text></div>
            <div className="intro-bg">
                <Title level={3}>現在の状況</Title>
                <Space direction="vertical" className="intro-dot">
                    <Text>制限は特にしてませんが、まずは大学内のみで運用しています。</Text>
                    <Text>2022年春リリース予定のSplanntと同様のプライバシーポリシーを適用します。<Link href="https://splannt.com/policy">プライバシーポリシー</Link></Text>
                    <Text>2022年春リリース予定のSplanntと同様の利用規約を適用します。<Link href="https://splannt.com/terms">利用規約</Link></Text>
                    <Text>連絡先: <Link href="mailto:info@branchism.com">info@branchism.com</Link></Text>
                </Space>
            </div>
        </Space>
    </>)
}

export default Intro