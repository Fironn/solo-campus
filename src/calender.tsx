import type { EventHandler, FormEvent } from "react";
import type { UserCalender } from "./components/type"

import CalenderDetail from './calenderDetail'
import { useState, useEffect, useMemo, useRef } from 'react'
import { Layout, Button, Input, Checkbox, Row, Col, Spin, Slider, List, Card, Typography, Divider, Space, Badge } from 'antd';
import './calender.css';
import { getCalenderRange, setCalenderRange } from "./components/firebase"
import { getTimes, getDates, today, dateToDateString, getDateTimeString, strToPast, getDays } from './components/time'
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { CheckboxValueType } from "antd/lib/checkbox/Group";
const { Text, Link, Title } = Typography;

const Calender = (state: any) => {
    const [ edit, setEdit ] = useState(false);
    const [ loading, setLoading ] = useState(true);
    const [ calender, setCalender ] = useState<UserCalender[] | undefined>(undefined);
    const [ checkedList, setCheckedList ] = useState<CheckboxValueType[] | undefined>(undefined);
    const [ checkedDefault, setCheckedDefault ] = useState<string[]>([]);


    const onChange = (checkedValues: CheckboxValueType[]) => {
        if (edit) setCheckedList(checkedValues);
    }

    const onEdit = (s: boolean) => {
        state.onSubmit(!s);
        if (s === false) {
            const temp = getCheckedList()
            setCheckedList(temp);
            state.openDetail(undefined)
        }
        setEdit(s);
    }

    const onSubmit = async (event: FormEvent) => {
        state.onSubmit(false);
        var send: UserCalender[] = []
        var newCalender: UserCalender[] = calender !== undefined ? [ ...calender ] : []
        checkedList?.forEach((value: CheckboxValueType, index: number) => {
            if (checkedDefault.indexOf(String(value)) === -1) {
                send.push({ date: dateToDateString(String(value), 0), time: dateToDateString(String(value), 1), state: 1, room: "", locate: { lat: "", lng: "" } })
            }
        })
        checkedDefault?.forEach((value: CheckboxValueType, index: number) => {
            if (checkedList?.indexOf(String(value)) === -1) {
                send.push({ date: dateToDateString(String(value), 0), time: dateToDateString(String(value), 1), state: 0, room: "", locate: { lat: "", lng: "" } })
            }
        })
        const res = await setCalenderRange(send);
        setEdit(false);
        send.forEach((value, index) => {
            newCalender = newCalender.filter((item) => { if (item.date === value.date && item.time === value.time) return false; else return true });
            newCalender.push(value)
        })
        setCalender(newCalender)
        state.onSubmit(true);
    };

    const dates = getDates(today ? today : process.env.REACT_APP_CALENDER_DATE_FROM ? new Date(process.env.REACT_APP_CALENDER_DATE_FROM.toString()) : new Date("2021/10/1"), 0)
    const datesStr = getDates(today ? today : process.env.REACT_APP_CALENDER_DATE_FROM ? new Date(process.env.REACT_APP_CALENDER_DATE_FROM.toString()) : new Date("2021/10/1"), 2)
    const days = getDays(today ? today : process.env.REACT_APP_CALENDER_DATE_FROM ? new Date(process.env.REACT_APP_CALENDER_DATE_FROM.toString()) : new Date("2021/10/1"))

    const getCheckedList = () => {
        var temp: string[] = []
        dates.forEach((values, indexs) => {
            getTimes(new Date(values), 0).forEach((value, index) => {
                if (calender !== undefined) {
                    const dateCalender = calender.filter((item) => { if (item.date === dateToDateString(value, 0) && item.time === dateToDateString(value, 1)) return true; });
                    if (dateCalender.length > 0 && (dateCalender[ 0 ].state === 1 || dateCalender[ 0 ].state === 2)) {
                        temp.push(value)
                    }
                }
            });
        });
        return temp
    }

    useEffect(() => {
        const temp = getCheckedList()
        setCheckedDefault(temp);
        setCheckedList(temp);
        return () => {
        };
    }, [ calender ]);

    useEffect(() => {
        async function getState() {
            setCalender(await getCalenderRange(datesStr))
            setLoading(false)
        }
        if (calender === undefined) {
            getState();
        }
        return () => {
        };
    }, []);

    const dateTimeToData = (dateTime: string | undefined) => {
        if (calender !== undefined && dateTime !== undefined) {
            const dateCalenders = calender.filter((item: UserCalender) => {
                if (item.date === dateToDateString(dateTime, 0) && item.time === dateToDateString(dateTime, 1))
                    return true;
            });
            return dateCalenders[ 0 ]
        }
        return undefined
    }

    return <Layout id="calender">
        <Spin tip="Loading..." spinning={loading} >
            <Space direction="vertical" style={{ width: '100%' }}>
                <Row style={{ width: '100%' }}>
                    <Col flex="auto">
                        <Title level={3} className="c-title">空き時間を予約する</Title>
                    </Col>
                    <Col>
                        {edit ?
                            <span>
                                <Space>
                                    <Button type="primary" disabled={!(state.form || edit)} onClick={onSubmit} >
                                        保存
                                    </Button>
                                    <Button disabled={!(state.form || edit)} onClick={() => onEdit(false)} >
                                        キャンセル
                                    </Button>
                                </Space>
                            </span> :
                            <Button className="c-button" type="primary" disabled={!state.form} onClick={() => onEdit(true)} >
                                編集
                            </Button>
                        }
                    </Col>
                </Row>
                <Checkbox.Group style={{ width: '100%' }} onChange={onChange} value={checkedList} >
                    <Row gutter={[ 0, 0 ]} className="c-l" >
                        <Col span={3} key={0}>
                            <Row gutter={[ 0, 0 ]} className="c-s c-o" key={-1}></Row>
                            <Row gutter={[ 0, 0 ]} className="c-s c-o" key={0}></Row>
                            {
                                getTimes(today, 1).map((value, index) =>
                                    <Row gutter={[ 0, 0 ]} className="c-s c-o" key={index + 1}><Text style={{ margin: 'auto' }}>{value}</Text></Row>
                                )
                            }
                        </Col>
                        {
                            dates.map((values, indexs) => <Col span={3} key={indexs + 1}>
                                <Row gutter={[ 0, 0 ]} className={`c-s c-o c-o-${indexs === 0 ? 't' : indexs % 2 == 1 ? 'e' : 'o'}`} key={-1}><Text style={{ margin: 'auto' }}>{dateToDateString(values, 2)}</Text></Row>
                                <Row gutter={[ 0, 0 ]} className={`c-s c-o c-o-${indexs === 0 ? 't' : indexs % 2 == 1 ? 'e' : 'o'}`} key={0}><Text style={{ margin: 'auto' }}>{days[ indexs ]}</Text></Row>
                                {
                                    getTimes(new Date(values), 0).map((value, index) => {
                                        if (calender !== undefined && value !== undefined) {
                                            const dateCalender = calender.filter((item: UserCalender) => {
                                                if (item.date === dateToDateString(value, 0) && item.time === dateToDateString(value, 1))
                                                    return true;
                                            });
                                            return <CalenderDetail dateTimeToData={dateTimeToData} key={index + 1} dateCalender={dateCalender} value={value} index={index} indexs={indexs} openDetail={state.openDetail} noticeBudge={state.noticeBudge} edit={edit} />
                                        } else {
                                            return <CalenderDetail dateTimeToData={dateTimeToData} key={index + 1} dateCalender={undefined} value={value} index={index} indexs={indexs} openDetail={state.openDetail} noticeBudge={state.noticeBudge} edit={edit} />
                                        }
                                    })

                                }
                            </Col>
                            )
                        }
                    </Row>
                </Checkbox.Group>
            </Space>
        </Spin>
    </Layout >
}

export default Calender