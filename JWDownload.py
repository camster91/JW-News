import os
import requests
import time
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

def setup_driver():
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    return driver

def scrape_video_titles(driver, url):
    driver.get(url)
    time.sleep(5)
    html = driver.page_source
    soup = BeautifulSoup(html, 'html.parser')
    return [link.text.strip() for link in soup.find_all("div", {"class": "syn-body lss"})]

def process_video(driver, title, target_folder, session, max_retries, url):
    element = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.LINK_TEXT, title)))
    driver.execute_script("arguments[0].scrollIntoView();", element)
    element.click()
    
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CLASS_NAME, "dropdownHandle"))).click()
    html = driver.page_source
    soup = BeautifulSoup(html, 'html.parser')

    file = soup.find('a', {'class': 'secondaryButton'})
    file_link = file["href"]
    file_name = file["href"].split("/")[-1]
    complete_file_path = os.path.join(target_folder, file_name)

    if not os.path.isfile(complete_file_path):
        success = False
        retries = 0
        while not success and retries < max_retries:
            try:
                r = session.get(file_link, allow_redirects=True)
                r.raise_for_status()
                with open(complete_file_path, 'wb') as f:
                    f.write(r.content)
                success = True
            except requests.exceptions.RequestException as e:
                retries += 1
                if retries < max_retries:
                    print(f"Download failed for {file_name}. Retrying ({retries}/{max_retries})...")
                else:
                    print(f"Download failed for {file_name}. Skipping after {max_retries} retries.")
    driver.back()


def main():
    target_folder = r"D:\JW.ORG\Latest"
    if not os.path.exists(target_folder):
        os.makedirs(target_folder)

    url = "https://www.jw.org/en/library/videos/#en/categories/LatestVideos"
    driver = setup_driver()
    video_titles = scrape_video_titles(driver, url)
    session = requests.Session()

    for title in video_titles:
        process_video(driver, title, target_folder, session, 3, url)

    driver.quit()

if __name__ == "__main__":
    main()
