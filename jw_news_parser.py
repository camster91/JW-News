import time
import smtplib
import pickle
import feedparser
import os
from selenium import webdriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

option = Options()
option.headless = False
driver = webdriver.Chrome(options=option)

os.environ['WDM_LOG_LEVEL'] = '0'

driver.minimize_window()
driver.get('https://www.jw.org/en/library/videos/#en/categories/LatestVideos')


time.sleep(5)

html = driver.page_source
soup = BeautifulSoup(html, 'html.parser')

videos_list = []
old_links = []

try:
    with open('C:/Python JW News/old_links.txt', 'rb') as filehandle:
        old_links = pickle.load(filehandle)
except:
    print("File empty") 

for link in soup.find_all("div", {"class":"synopsis lss desc showImgOverlay hasDuration jsLanguageAttributes dir-ltr lang-en ml-E ms-ROMAN"}):
    links_dict = {}
    href = link.a['href']
    links_dict['Title']  = link.find('div', {'class':'syn-body lss'}).text.strip()
    links_dict['Image'] = link.img['src']

    links_dict['Link'] = href

    if href not in old_links:

        videos_list.append(links_dict)
        old_links.append(href)

        with open('C:/Python JW News/old_links.txt', 'wb') as filehandle:
            pickle.dump(old_links, filehandle)
    else:
        continue

d = feedparser.parse('https://www.jw.org/en/whats-new/rss/WhatsNewWebArticles/feed.xml')

news_list = []
old_news = []

try:
    with open('C:/Python JW News/old_news.txt', 'rb') as filehandle:
        old_news = pickle.load(filehandle)
except:
    print("File empty")

for entry in d.entries:
    news_dict = {}
    news_title = entry.title
    news_link = entry.link

    news_dict['Link'] = news_link
    news_dict['Title'] = news_title

    try:
        news_img = entry.summary.split('=')[3].split(' ')[0].replace('"', '')
        news_dict['Image'] = news_img
    except:
        news_dict['Image'] = ""

    if news_link not in old_news:

        news_list.append(news_dict)
        old_news.append(news_link)

        with open('C:/Python JW News/old_news.txt', 'wb') as filehandle:
            pickle.dump(old_news, filehandle)
    else:
        continue
    
videos = ""
news = ""
count = 0

for i in videos_list:
    videos += open("C:/Python JW News/email.html").read().format(Text1=videos_list[count]['Title'], 
                                            Link1=videos_list[count]['Link'], 
                                            Img1=videos_list[count]['Image'])
    count += 1

count = 0

if videos_list != []:
    videos = "<h3>Latest Videos</h3>" + videos

for i in news_list:
    news += open("C:/Python JW News/news.html").read().format(Text2=news_list[count]['Title'], 
                                            Link2=news_list[count]['Link'], 
                                            Img2=news_list[count]['Image'])
    count += 1

if news_list != []:
    news = "<h3>Latest News</h3>" + news
    
me = "JW Newsfeed"
you = "jworgnewsfeed@gmail.com"  
them = ["biancabashley@gmail.com","camster91@gmail.com",
        "kesjasamotik@hotmail.com","matthewplawn@gmail.com",
        "E.obszanska@hotmail.com","aaronm631@gmail.com",
        "nancyjashley@live.com","gordlashley@gmail.com",
        "Daniel-d-janeiro@live.ca", "chrislawrence4@hotmail.com",
        "mariah_papiah@hotmail.com", "aaroncastillo86@gmail.com",
        "janitacastillo85@gmail.com"
       ]

msg = MIMEMultipart('alternative')
msg['Subject'] = "New Posts From JW.ORG"
msg['From'] = me
msg['To'] = you

text = "HTML only. Please enable HTML email."
        
html = open("C:/Python JW News/Start.html").read() + videos + news + "</table></body></html>"

part1 = MIMEText(text, 'plain')
part2 = MIMEText(html, 'html')

if news_list or videos_list != []:
    msg.attach(part1)
    msg.attach(part2)

    mail = smtplib.SMTP('smtp.gmail.com', 587)

    mail.ehlo()

    mail.starttls()

    mail.login('jworgnewsfeed@gmail.com', 'Willow123!')
    mail.sendmail(me, [you] + them, msg.as_string())
    mail.quit()

driver.quit()
