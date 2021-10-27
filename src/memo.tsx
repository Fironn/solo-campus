import { Tooltip, Button, Typography, Space, Row, Col, Divider } from 'antd';
import './memo.css'

const { Text, Link, Title } = Typography;

const Memo = (state: any) => {
    const explain = <Space direction="vertical" className="memo-detail" size={10}>
        <Title level={5} style={{ color: 'white', textAlign: 'center', width: '100%' }}>スケジュールの見方</Title>
        <Row gutter={[ 4, 4 ]}>
            <Col flex='10px' style={{ color: 'blanchedalmond' }}>■</Col><Col flex='auto'><Text style={{ color: 'blanchedalmond' }}>予約ができます</Text></Col>
            <Col><Text style={{ color: 'white' }}>編集ボタンで予約したい日時を選択し、保存をすると指定した場所から2km以内のユーザーから自動的に探索します。</Text></Col>
        </Row>
        <Row gutter={[ 4, 4 ]}>
            <Col flex='10px' style={{ color: 'rgb(236, 173, 0)' }}>■</Col><Col flex='auto'><Text style={{ color: 'rgb(236, 173, 0)' }}>予約済みです</Text></Col>
            <Col><Text style={{ color: 'white' }}>探索終わるまで待ちましょう。</Text></Col>
        </Row>
        <Row gutter={[ 4, 4 ]}>
            <Col flex='10px' style={{ color: 'rgb(216, 157, 255)' }}>■</Col><Col flex='auto'><Text style={{ color: 'rgb(216, 157, 255)' }}>相手が見つかりました</Text></Col>
            <Col><Text style={{ color: 'white' }}>どちらかがまだ承認ボタンを押していない状態です。 承認ボタンを押したら、返信を待ちましょう。どちらかが拒否ボタンを押すと自動的にペアが解消され、再探索されます。</Text></Col>
        </Row>
        <Row gutter={[ 4, 4 ]}>
            <Col flex='10px' style={{ color: 'green' }}>■</Col><Col flex='auto'><Text style={{ color: 'green' }}>場所や日程の変更はできません</Text></Col>
            <Col><Text style={{ color: 'white' }}>どちらも承認ボタンを選択すると、予定が確定されます。時間になったら指定の場所に向かいましょう。都合が悪くなったら事前にチャットで伝えましょう。</Text></Col>
        </Row>
        <Row gutter={[ 4, 4 ]}>
            <Col flex='10px' style={{ color: 'gray' }}>■</Col><Col flex='auto'><Text style={{ color: 'gray' }}>時間が経過しました</Text></Col>
            <Col><Text style={{ color: 'white' }}>予約や過去のルームの観覧はできません。</Text ></Col>
        </Row>
    </Space >

    return <Tooltip placement="rightTop" title={explain} id="memo" >
        <Button className="memo-button">?</Button>
    </Tooltip>
}

export default Memo