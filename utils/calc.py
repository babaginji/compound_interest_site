import os
import json


def compound_interest(principal, annual_rate, years, monthly_addition=0):
    """
    複利計算（最終資産のみ）
    principal: 元本
    annual_rate: 年利（%）
    years: 年数
    monthly_addition: 毎月追加投資
    """
    total = principal
    for year in range(years):
        for month in range(12):
            total += monthly_addition
            total *= 1 + annual_rate / 100 / 12
    return round(total, 2)


def compound_interest_with_history(principal, annual_rate, years, monthly_addition=0):
    """
    複利計算＋毎月資産推移を返す
    """
    total = principal
    history = [round(total, 2)]  # 初期元本
    for year in range(years):
        for month in range(12):
            total += monthly_addition
            total *= 1 + annual_rate / 100 / 12
            history.append(round(total, 2))
    return round(total, 2), history


def save_history(history, filename="data/history.json"):
    """
    計算履歴を保存
    """
    if not os.path.exists("data"):
        os.makedirs("data")
    # 過去履歴がある場合は読み込む
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            all_history = json.load(f)
    else:
        all_history = []

    all_history.append(history)

    with open(filename, "w", encoding="utf-8") as f:
        json.dump(all_history, f, ensure_ascii=False, indent=2)


def load_history(filename="data/history.json"):
    """
    計算履歴を取得
    """
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            return json.load(f)
    return []
