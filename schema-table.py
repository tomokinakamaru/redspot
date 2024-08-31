from sqlite3 import connect

connection = connect("tests/x.db")

result = connection.execute("PRAGMA table_info('data')")

print("<!-- prettier-ignore-start -->")
print("|Name|Type|Nullable|")
print("|:---|:---|:-------|")
for _, name, type, notnull, _, _ in result:
    notnull = "NO" if notnull else "YES"
    print(f"|{name}|{type}|{notnull}|")
print("<!-- prettier-ignore-end -->")
