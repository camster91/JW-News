import time
import os
import os.path
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

option = Options()
option.headless = False
driver = webdriver.Chrome(options=option)

sections = open("D:\JW.ORG\_links.txt").readlines()

for section in sections:

    driver.get(section)

    time.sleep(3)

    html = driver.page_source
    soup = BeautifulSoup(html, 'html.parser')

    master_list = []

    for link in soup.find_all("div", {"class":"syn-body lss"}):
        title = link.text.strip()
        master_list.append(title)

        #if len(master_list) >= 1:
            #break

    for i in master_list:
        
        time.sleep(3)

        nextButton = driver.find_element_by_link_text(i)
        nextButton.click()

        html = driver.page_source
        soup = BeautifulSoup(html, 'html.parser')

        time.sleep(3)

        download_button = driver.find_element_by_class_name("dropdownHandle")
        download_button.click()

        html = driver.page_source
        soup = BeautifulSoup(html, 'html.parser')

        time.sleep(3)

        file = soup.find('a', {'class':'secondaryButton'})
        file_link = file["href"]
        file_name = file["href"].split("/")[-1]

        if  os.path.isfile(file_name):
            driver.back()
            continue

        else:
            r = requests.get(file_link, allow_redirects=True) 
            open(file_name, 'wb').write(r.content)

            time_to_wait = 120
            time_counter = 0

            while not os.path.exists(file_name):
                time.sleep(1)
                time_counter += 1
                if time_counter > time_to_wait:break

        driver.back()

driver.quit()
