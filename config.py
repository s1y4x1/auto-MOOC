import requests
termId=#填写课程url中的tid
#前往浏览器登录后获取对应Cookie
STUDY_SESS='''
#在此处粘贴STUDY_SESS Cookie
'''.strip()
NTESSTUDYSI='0'#非必需
url_down = "https://www.icourse163.org/web/j/mocQuizRpcBean.getOpenHomeworkPaperDto.rpc"
url_up = "https://www.icourse163.org/web/j/mocQuizRpcBean.submitAnswers.rpc"
url_get='https://www.icourse163.org/web/j/mocQuizRpcBean.getOpenQuizPaperDto.rpc'
url_check='https://www.icourse163.org/web/j/courseBean.getLastLearnedMocTermDto.rpc'
headers = {
    'content-type': 'application/json;charset=UTF-8',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
}
cookies = {
    'NTESSTUDYSI': NTESSTUDYSI,
    'STUDY_SESS': STUDY_SESS
}
params={'csrfKey': NTESSTUDYSI}
post=lambda url,data:requests.post(url,params=params,headers=headers,cookies=cookies,json=data).json()
if __name__=='__main__':
    l=open('config.py', 'r', encoding='utf-8').readlines()
    l[3]=input('STUDY_SESS: ')+'\n'
    with open('config.py','w',encoding='utf-8')as f:f.writelines(l)
