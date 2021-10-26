import type { EventHandler, FormEvent } from "react";
import type { UserCalender } from "./components/type"

import { useState, useEffect, useMemo, useRef } from 'react'
import { Layout, Button, Input, Checkbox, Row, Col, Spin, Slider, List, Card, Typography, Divider, Space, Badge } from 'antd';
import './calender.css';
import { getTimes, getDates, today, dateToDateString, getDateTimeString, strToPast, getDays } from './components/time'
const { Text, Link, Title } = Typography;

const CalenderDetailDetail_i = (state: any) => {
    return <Row gutter={[ 0, 0 ]} className="c-s c-s-end" key={state.index + 1} >
        <Checkbox value={state.value} disabled={true}>
            <Text style={{ margin: 'auto' }}>{state.value}</Text>
        </Checkbox>
    </Row>
}

const CalenderDetailDetail_4 = (state: any) => {
    return <Row gutter={[ 0, 0 ]} className="c-s c-s-end" key={state.index + 1} >
        <div className="c-s-click" style={{ 'display': state.edit ? 'none' : 'block' }} onClick={() => state.openDetail(state.dateTimeToData(state.value))} />
        <Checkbox value={state.value} disabled={true}>
            <Text style={{ margin: 'auto' }}>{state.value}</Text>
        </Checkbox>
    </Row>
}

const CalenderDetailDetail_3 = (state: any) => {
    return <Row gutter={[ 0, 0 ]} className="c-s c-s-yes" key={state.index + 1} >
        <Badge count={state.count} overflowCount={10}>
            <div className="c-s-click" style={{ 'display': state.edit ? 'none' : 'block' }} onClick={() => state.openDetail(state.dateTimeToData(state.value))} />
        </Badge>
        <Checkbox value={state.value} disabled={true}>
            <Text style={{ margin: 'auto' }}>{state.value}</Text>
        </Checkbox>
    </Row>
}

const CalenderDetailDetail_2 = (state: any) => {

    return <Row gutter={[ 0, 0 ]} className="c-s c-s-wait" key={state.index + 1} >
        <Badge count={state.count} overflowCount={10}>
            <div className="c-s-click" style={{ 'display': state.edit ? 'none' : 'block' }} onClick={() => state.openDetail(state.dateTimeToData(state.value))} />
        </Badge>
        <Checkbox value={state.value} disabled={true}>
            <Text style={{ margin: 'auto' }}>{state.value}</Text>
        </Checkbox>
    </Row>
}

const CalenderDetailDetail_1 = (state: any) => {
    return <Row gutter={[ 0, 0 ]} className={`c-s c-s-${state.indexs === 0 ? 't' : state.indexs % 2 == 1 ? 'e' : 'o'}`} key={state.index + 1} >
        <div className="c-s-click" style={{ 'display': state.edit ? 'none' : 'block' }} onClick={() => state.openDetail(state.dateTimeToData(state.value))} />
        <Checkbox value={state.value} >
            <Text style={{ margin: 'auto' }}>{state.value}</Text>
        </Checkbox>
    </Row>
}

const CalenderDetailDetail_0 = (state: any) => {
    return <Row gutter={[ 0, 0 ]} className={`c-s c-s-${state.indexs === 0 ? 't' : state.indexs % 2 == 1 ? 'e' : 'o'}`} key={state.index + 1} >
        <div className="c-s-click" style={{ 'display': state.edit ? 'none' : 'block', 'cursor': 'auto' }} onClick={() => state.openDetail(state.dateTimeToData(undefined))} />
        <Checkbox value={state.value} >
            <Text style={{ margin: 'auto' }}>{state.value}</Text>
        </Checkbox>
    </Row>
}

const CalenderDetail = (state: any) => {
    const getNoticeNum = (dateTime: string) => {
        if (dateTime) {
            // console.log("CalenderDetail", state.noticeBudge)
            const temp = getDateTimeString(new Date(dateTime), 0)
            const temps = state.noticeBudge.filter((value: any) => {
                return value.date === temp.date && value.time === temp.time
            });
            return temps.length
        } else {
            return 0
        }
    }

    return (state.dateCalender !== undefined ?
        (state.indexs == 0 && strToPast(state.value) ?
            <CalenderDetailDetail_i index={state.index} value={state.value} />

            : state.dateCalender.length > 0 && state.dateCalender[ 0 ].state === 4
                ? <CalenderDetailDetail_4 openDetail={state.openDetail} dateTimeToData={state.dateTimeToData} index={state.index} edit={state.edit} value={state.value} />

                : state.dateCalender.length > 0 && state.dateCalender[ 0 ].state === 3 ?
                    <CalenderDetailDetail_3 openDetail={state.openDetail} dateTimeToData={state.dateTimeToData} count={getNoticeNum(state.value)} index={state.index} edit={state.edit} getNoticeNum={getNoticeNum} value={state.value} />

                    : state.dateCalender.length > 0 && state.dateCalender[ 0 ].state === 2 ?
                        <CalenderDetailDetail_2 openDetail={state.openDetail} dateTimeToData={state.dateTimeToData} count={getNoticeNum(state.value)} index={state.index} edit={state.edit} getNoticeNum={getNoticeNum} value={state.value} />

                        : state.dateCalender.length > 0 && state.dateCalender[ 0 ].state === 1 ?
                            <CalenderDetailDetail_1 openDetail={state.openDetail} dateTimeToData={state.dateTimeToData} indexs={state.indexs} index={state.index} edit={state.edit} value={state.value} />

                            : <CalenderDetailDetail_0 openDetail={state.openDetail} dateTimeToData={state.dateTimeToData} indexs={state.indexs} index={state.index} edit={state.edit} value={state.value} />
        ) : <CalenderDetailDetail_0 openDetail={state.openDetail} dateTimeToData={state.dateTimeToData} indexs={state.indexs} index={state.index} edit={state.edit} value={state.value} />
    )
}

export default CalenderDetail