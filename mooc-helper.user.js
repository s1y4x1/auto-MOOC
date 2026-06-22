// ==UserScript==
// @name         中国大学MOOC 一键完成助手
// @namespace    https://github.com/yourusername
// @version      1.0
// @description  自动完成单元测试/单元作业/考试，支持一键完成全部
// @author       You
// @match        https://www.icourse163.org/learn/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      ginnnnnn.top
// @connect      www.icourse163.org
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    /* ============================= Constants ============================= */

    const API = {
        QUIZ_PAPER: 'https://www.icourse163.org/web/j/mocQuizRpcBean.getOpenQuizPaperDto.rpc',
        HW_PAPER:   'https://www.icourse163.org/web/j/mocQuizRpcBean.getOpenHomeworkPaperDto.rpc',
        SUBMIT:     'https://www.icourse163.org/web/j/mocQuizRpcBean.submitAnswers.rpc',
        COURSE:     'https://www.icourse163.org/web/j/courseBean.getLastLearnedMocTermDto.rpc',
        ANSWER:     'https://ginnnnnn.top/api/mooc/test/',
    };

    /* ============================= Utilities ============================= */

    function getCookie(name) {
        const m = document.cookie.match(new RegExp('(?:^| )' + name + '=([^;]*)'));
        return m ? decodeURIComponent(m[1]) : '';
    }

    function csrfKey() { return getCookie('NTESSTUDYSI'); }

    function getTid() {
        const m = location.search.match(/[?&]tid=(\d+)/);
        return m ? m[1] : '';
    }

    function getId() {
        const m = location.hash.match(/[?&]id=(\d+)/);
        return m ? m[1] : '';
    }

    function pageType() {
        const h = location.hash;
        if (/examObject/i.test(h)) return 'exam';
        if (/\/quiz/i.test(h))    return 'quiz';
        if (/\/hw/i.test(h))      return 'hw';
        return 'course';
    }

    /* ============================= API calls ============================= */

    function apiPost(url, data) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'POST',
                url: url + '?csrfKey=' + encodeURIComponent(csrfKey()),
                headers: { 'Content-Type': 'application/json;charset=UTF-8' },
                data: JSON.stringify(data),
                withCredentials: true,
                onload:  r => { try { resolve(JSON.parse(r.responseText)); } catch (e) { reject(e); } },
                onerror: reject,
            });
        });
    }

    function apiGet(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                onload:  r => { try { resolve(JSON.parse(r.responseText)); } catch (e) { reject(e); } },
                onerror: reject,
            });
        });
    }

    /* ============================= Actions ============================= */

    async function completeQuiz(tid) {
        console.log('[mooc-helper] 开始完成单元测试/考试, tid:', tid);

        let extData;
        try {
            extData = await apiGet(API.ANSWER + tid);
        } catch (e) {
            console.warn('[mooc-helper] 外部答案API获取失败，使用空答案集', e);
            extData = { data: { questionList: [] } };
        }

        console.log('[mooc-helper] 获取试卷...');
        const paperResp = await apiPost(API.QUIZ_PAPER, { tid });
        const result = paperResp.result;
        if (!result) throw new Error('试卷数据为空');

        const correctIds = new Set();
        const qList = extData.data?.questionList || [];
        for (const q of qList)
            for (const o of (q.optionList || []))
                if (o.answer) correctIds.add(o.id);

        console.log('[mooc-helper] 匹配到', correctIds.size, '道正确答案，准备提交');
        const answers = (result.objectiveQList || []).map(Q => ({
            qid: Q.id,
            type: Q.type,
            optIds: (Q.optionDtos || []).filter(o => correctIds.has(o.id)).map(o => o.id),
            time: Math.floor(Date.now() / 1000),
        }));
        result.answers = answers;
        console.log('[mooc-helper] 提交答案...');
        return apiPost(API.SUBMIT, { paperDto: result, preview: false });
    }

    async function completeHomework(tid) {
        console.log('[mooc-helper] 开始完成单元作业, tid:', tid);
        let paper;
        for (let i = 0; i < 10; i++) {
            console.log('[mooc-helper] 获取作业试卷, 尝试', i + 1);
            const res = await apiPost(API.HW_PAPER, { tid, withStdAnswerAndAnalyse: false });
            if (res.result) { paper = res; break; }
            if (i < 9) await new Promise(r => setTimeout(r, 1000));
        }
        if (!paper) throw new Error('获取作业失败（并发限制）');
        const result = paper.result;

        console.log('[mooc-helper] 构建作业答案...');
        const answers = (result.subjectiveQList || []).map(a => ({
            qid: a.id,
            type: a.type,
            content: {
                content: (a.judgeDtos || []).map(j => j.msg).join('\n'),
                attachments: [],
            },
        }));
        result.answers = answers;
        console.log('[mooc-helper] 提交作业答案...');
        return apiPost(API.SUBMIT, { paperDto: result, preview: false });
    }

    function completeExam(tid) {
        console.log('[mooc-helper] 完成考试 (同单元测试逻辑), tid:', tid);
        return completeQuiz(tid);
    }

    /* ============================= UI ============================= */

    GM_addStyle(`
        .mh-wrap { position:fixed; top:64px; right:16px; z-index:999999; display:flex; flex-direction:column; gap:8px; }
        .mh-panel { background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:12px 16px; box-shadow:0 4px 16px rgba(0,0,0,.12); font:14px/1.5 "Microsoft YaHei",sans-serif; min-width:150px; }
        .mh-btn { display:block; width:100%; padding:8px 14px; margin-bottom:6px; border:none; border-radius:4px; cursor:pointer; font-size:13px; font-weight:600; text-align:center; transition:.15s; }
        .mh-btn:last-child { margin-bottom:0; }
        .mh-btn:active { transform:scale(.97); }
        .mh-btn:disabled { opacity:.6; cursor:not-allowed; transform:none; }
        .mh-btn-red { background:#e4393c; color:#fff; }
        .mh-btn-red:hover:not(:disabled) { background:#c9302c; box-shadow:0 2px 8px rgba(228,57,60,.35); }
        .mh-btn-green { background:#52c41a; color:#fff; }
        .mh-btn-green:hover:not(:disabled) { background:#389e0d; box-shadow:0 2px 8px rgba(82,196,26,.35); }
        .mh-status { font-size:12px; color:#888; word-break:break-all; line-height:1.4; margin-top:4px; }
        .mh-status.ok    { color:#52c41a; }
        .mh-status.err   { color:#e4393c; }
        .mh-status.info  { color:#1890ff; }
    `);

    let container = null;

    function buildUI() {
        if (container) container.remove();
        container = document.createElement('div');
        container.className = 'mh-wrap';
        const panel = document.createElement('div');
        panel.className = 'mh-panel';
        container.appendChild(panel);
        document.body.appendChild(container);
        return panel;
    }

    function btn(text, onClick, color = 'red') {
        const el = document.createElement('button');
        el.className = 'mh-btn mh-btn-' + color;
        el.textContent = text;
        container.querySelector('.mh-panel').appendChild(el);
        el.addEventListener('click', async () => {
            el.disabled = true;
            el.textContent = '处理中…';
            setStatus('');
            try {
                const r = await onClick();
                setStatus('✅ 提交成功', 'ok');
                el.textContent = '✅ 已完成';
            } catch (e) {
                setStatus('❌ ' + (e.message || e), 'err');
                el.textContent = text;
                el.disabled = false;
            }
        });
        return el;
    }

    function setStatus(msg, cls = '') {
        let el = container.querySelector('.mh-status');
        if (!el) {
            el = document.createElement('div');
            el.className = 'mh-status';
            container.querySelector('.mh-panel').appendChild(el);
        }
        el.textContent = msg;
        el.className = 'mh-status ' + cls;
    }

    /* ============================= Page handler ============================= */

    function handlePage() {
        const type = pageType();
        const id   = getId();
        const tid  = getTid();
        const panel = buildUI();

        if (type === 'course') {
            if (!tid) { setStatus('未检测到课程 tid', 'err'); return; }
            btn('一键完成全部', async () => {
                console.log('[mooc-helper] 获取课程信息...');
                const res = await apiPost(API.COURSE, { termId: parseInt(tid) });
                const term = res.result?.mocTermDto;
                if (!term) throw new Error('获取课程信息失败');

                const chapters = term.chapters || [];
                const items = [];
                for (const ch of chapters) {
                    for (const hw of (ch.homeworks || [])) {
                        const t = hw.test;
                        if (t && !(t.deadline && t.deadline < Date.now()))
                            items.push({ type: 'hw', id: t.id });
                    }
                    for (const q of (ch.quizs || [])) {
                        const t = q.test;
                        if (t && !(t.deadline && t.deadline < Date.now()) &&
                            (!t.userScore || t.userScore < t.totalScore))
                            items.push({ type: 'quiz', id: t.id });
                    }
                    const ex = ch.exam?.objectTestVo;
                    if (ex && !(ex.deadline && ex.deadline < Date.now()) &&
                        (!ex.userScore || ex.userScore < ex.totalScore))
                        items.push({ type: 'exam', id: ex.id });
                }

                if (items.length === 0) {
                    throw new Error('没有待完成的任务（均已满分或已截止）');
                }

                let done = 0;
                for (const item of items) {
                    setStatus(`处理中 (${done + 1}/${items.length})…`, 'info');
                    console.log('[mooc-helper] 开始处理:', item.type, item.id);
                    try {
                        if (item.type === 'hw') await completeHomework(item.id);
                        else await completeQuiz(item.id);
                        done++;
                        console.log('[mooc-helper] 完成:', item.type, item.id);
                    } catch (e) {
                        console.error('[mooc-helper] 失败:', item.type, item.id, e);
                    }
                }
                setStatus(done === items.length
                    ? `✅ 全部完成 (${done}/${items.length})`
                    : `完成 ${done}/${items.length}，${items.length - done} 项失败`,
                    done === items.length ? 'ok' : 'err');
            });
        } else if (type === 'quiz' && id) {
            btn('完成单元测试', () => completeQuiz(id));
        } else if (type === 'hw' && id) {
            btn('完成单元作业', () => completeHomework(id));
        } else if (type === 'exam' && id) {
            btn('完成考试',     () => completeExam(id));
        }
    }

    /* ============================= Init ============================= */

    setTimeout(handlePage, 800);
    window.addEventListener('hashchange', () => setTimeout(handlePage, 800));

})();
