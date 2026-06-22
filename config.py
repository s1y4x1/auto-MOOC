import requests
termId=int(
1476491494
)#填写课程url中的tid
#前往浏览器登录后获取对应Cookie
STUDY_SESS='''
"2rP32wlCWutbSBzL3WvXX7HlqSsBJImjkVZyIHRdE9SbrBjiRLwazwuuLtLCoBccw6131oB2gWL29zCLd3+PEtXAZaEFfeXA6bQedO+spt5i5+7GeXDEgZ7Ql8UEv8vXSiGVJbrca51DO2Z/0kJOeBoOR4kE435+Vl4R3cNN3UgLhur2Nm2wEb9HcEikV+3FTI8+lZKyHhiycNQo+g+/oA=="
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
    l[2]=(input('tid: ')or l[2][:-1])+'\n'
    l[6]=(input('STUDY_SESS: ')or l[6][:-1])+'\n'
    with open('config.py','w',encoding='utf-8')as f:f.writelines(l)
