import type { EventHandler, FormEvent } from "react";
import type { UserCalender } from "./components/type"

import { useState, useEffect, useMemo } from 'react'
import { Layout, Button, Input, Checkbox, Row, Col, Spin, Slider, List, Card, Typography, Divider } from 'antd';
import './calender.css';
import { getCalenderRange, setCalenderRange } from "./components/firebase"
import { format } from 'date-fns'
import { getTimes, getDates, today, dateToDateString } from './components/time'
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { CheckboxValueType } from "antd/lib/checkbox/Group";
const { Text, Link } = Typography;

const Calender = (state: any) => {
    const [ form, setForm ] = useState(true);
    const [ edit, setEdit ] = useState(false);
    const [ loading, setLoading ] = useState(true);
    const [ calender, setCalender ] = useState<UserCalender[] | undefined>(undefined);
    const [ checkedList, setCheckedList ] = useState<CheckboxValueType[] | undefined>(undefined);
    const [ checkedDefault, setCheckedDefault ] = useState<string[]>([]);


    const onChange = (checkedValues: CheckboxValueType[]) => {
        if (edit) setCheckedList(checkedValues);
    }

    const onEdit = (s: boolean) => {
        if (s === false) {
            const temp = getCheckedList()
            setCheckedList(temp);
            state.openDetail(undefined)
        }
        setEdit(s);
    }

    const onSubmit = async (event: FormEvent) => {
        setForm(false);
        var send: UserCalender[] = []
        checkedList?.forEach((value: CheckboxValueType, index: number) => {
            if (checkedDefault.indexOf(String(value)) === -1) {
                send.push({ date: dateToDateString(String(value), 0), time: dateToDateString(String(value), 1), state: 1, room: "" })
            }
        })
        checkedDefault?.forEach((value: CheckboxValueType, index: number) => {
            if (checkedList?.indexOf(String(value)) === -1) {
                send.push({ date: dateToDateString(String(value), 0), time: dateToDateString(String(value), 1), state: 0, room: "" })
            }
        })
        const res = await setCalenderRange(send);
        setForm(true);
    };

    const dateTimeToData = (dateTime: string) => {
        if (calender !== undefined) {
            const dateCalender = calender.filter((item) => { if (item.date === dateToDateString(dateTime, 0) && item.time === dateToDateString(dateTime, 1)) return true; });
            return dateCalender[ 0 ]
        }
        return {}
    }

    const dates = getDates(process.env.REACT_APP_CALENDER_DATE_FROM ? new Date(process.env.REACT_APP_CALENDER_DATE_FROM.toString()) : today, 0)
    const datesStr = getDates(process.env.REACT_APP_CALENDER_DATE_FROM ? new Date(process.env.REACT_APP_CALENDER_DATE_FROM.toString()) : today, 2)

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
    }, [ calender ]);

    useEffect(() => {
        async function getState() {
            setCalender(await getCalenderRange(datesStr))
            setLoading(false)
        }
        if (calender === undefined) {
            getState();
        }
    }, []);

    return <>
        <Spin tip="Loading..." spinning={loading}>
            <Checkbox.Group style={{ width: 'auto' }} onChange={onChange} value={checkedList}>
                <Row gutter={[ 0, 0 ]} className="c-l">
                    <Col span={3} key={0}>
                        <Row gutter={[ 0, 0 ]} className="c-s c-o" key={0}></Row>
                        {
                            getTimes(today, 1).map((value, index) =>
                                <Row gutter={[ 0, 0 ]} className="c-s c-o" key={index + 1}><Text style={{ margin: 'auto' }}>{value}</Text></Row>
                            )
                        }
                    </Col>
                    {
                        dates.map((values, indexs) => <Col span={3} key={indexs + 1}>
                            <Row gutter={[ 0, 0 ]} className="c-s c-o" key={0}><Text style={{ margin: 'auto' }}>{dateToDateString(values, 2)}</Text></Row>
                            {
                                getTimes(new Date(values), 0).map((value, index) => {
                                    if (calender !== undefined) {
                                        const dateCalender = calender.filter((item) => { if (item.date === dateToDateString(value, 0) && item.time === dateToDateString(value, 1)) return true; });
                                        if (dateCalender.length > 0 && dateCalender[ 0 ].state === 2) {
                                            return <Row gutter={[ 0, 0 ]} className="c-s" key={index + 1} ><div className="c-s-click" style={{ 'display': edit ? 'none' : 'block' }} onClick={() => state.openDetail(dateTimeToData(value))} /><Checkbox value={value} disabled={true}><Text style={{ margin: 'auto' }}>{value}</Text></Checkbox></Row>
                                        }
                                    }
                                    return <Row gutter={[ 0, 0 ]} className="c-s" key={index + 1} ><div className="c-s-click" style={{ 'display': edit ? 'none' : 'block' }} onClick={() => state.openDetail(dateTimeToData(value))} /><Checkbox value={value} ><Text style={{ margin: 'auto' }}>{value}</Text></Checkbox></Row>
                                })
                            }
                        </Col>
                        )
                    }
                </Row>
            </Checkbox.Group>
            {edit ?
                <>
                    <Button type="primary" disabled={!form} onClick={() => onEdit(false)} >
                        キャンセル
                    </Button>
                    <Button type="primary" disabled={!form} onClick={onSubmit} >
                        保存
                    </Button>
                </> :
                <Button type="primary" disabled={!form} onClick={() => onEdit(true)} >
                    編集
                </Button>
            }
        </Spin>
    </>
}

export default Calender