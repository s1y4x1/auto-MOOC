from 单元作业 import *
from 单元测试 import *
mocTerm=post(url_check,{'termId':termId})['result']['mocTermDto']
chapters,courseName=mocTerm['chapters'],mocTerm['courseName']
keys={
    'homework':['id','name','totalScore','userScore','deadline','evaluateStart','evaluateEnd','enableEvaluation','evaluateScoreReleaseTime'],
    'quiz':['id','name','totalScore','userScore','deadline'],
    'exam':['id','name','totalScore','userScore','deadline']
    }
chapters=[{'name':l['name'],
           'homeworks':[{k:h['test'][k]for k in keys['homework']}for h in l['homeworks']]if l['homeworks']else[],
           'quizs':[{k:q['test'][k]for k in keys['quiz']}for q in l['quizs']]if l['quizs']else[],
           'exam':{k:l['exam']['objectTestVo'][k]for k in keys['exam']}if l['exam']else None
           }for l in chapters]
t=lambda stamp:time.strftime("%Y-%m-%d %H:%M:%S",time.localtime(stamp/1000))
tab=0
p=lambda *args:print(tab*'\t',*args,sep='')
p(courseName)
tab+=1
for l in chapters:
    p(l['name'])
    tab+=1
    for h in l['homeworks']:
        p(h['name'])
        tab+=1
        dead=h['deadline']/1000<time.time()
        p('已'if dead else'未','截止（',t(h['deadline']),'）')
        p(''if h['enableEvaluation']else'不','可互评（',t(h['evaluateStart']),'~',t(h['evaluateEnd']),'）')
        p('得分：',h['userScore'],'/',h['totalScore'],'（公布于',t(h['evaluateScoreReleaseTime']),'）')
        if not dead and has_empty(h['id']):
            p('[!]存在未提交，尝试操作……')
            p(*homework(h['id']))
        tab-=1
    for q in l['quizs']:
        p(q['name'])
        tab+=1
        dead=q['deadline']/1000<time.time()
        p('已'if dead else'未','截止（',t(q['deadline']),'）')
        p('得分：',q['userScore'],'/',q['totalScore'])
        if not q['userScore']or q['userScore']<q['totalScore']:
            if dead:p('[!]未满分但已截止，只得跳过。')
            else:
                p('[!]当前未满分，尝试操作……')
                p(*quiz(q['id']))
        tab-=1
    if e:=l['exam']:
        p(e['name'])
        tab+=1
        dead=e['deadline']/1000<time.time()
        p('已'if dead else'未','截止（',t(e['deadline']),'）')
        p('得分：',e['userScore'],'/',e['totalScore'])
        if not e['userScore']or e['userScore']<e['totalScore']:
            if dead:p('[!]未满分但已截止，只得跳过。')
            else:
                p('[!]当前未满分，尝试操作……')
                p(*quiz(e['id']))
        tab-=1
    tab-=1
input('DONE!')
