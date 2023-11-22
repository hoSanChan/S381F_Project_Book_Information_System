COMP S381F, Book Information Management System
Group 70
CHAN Ho San, 12661978
WONG Ting Ho, 12660527

Application link: 

----------------------------------------------------
# Login
By providing their username and password, each user can access the restaurant information management system through the login page.

default userID and password;
[
	{userid: student1, password: 123},
	{userid: student2, password: 234},
	{suerid: student3, password: 345}

]


----------------------------------------------------
# Logout
Each user can click the logout button on the home page to logout their account.

----------------------------------------------------
# CRUD 
- Create 
Create operation can be used to add a book to the Book Information Management System by providing the following information.
A Book Information Management System document may contain the following attributes: 
	1)Book Name 
	2)ISBN, must be 13 digits long
	3)Category 
	4)Publisher 
	5)Author 
	6)Remark 
Reminder: ISBN is mandatory.

For Example: 
	1)Book Name: Les Miserables 
	2)ISBN:9781613820254
	3)Category: Historical fiction
	4)Publisher: Simon & Brown (September 26, 2012)
	5)Author: Victor Hugo
	6)Remark: - 



----------------------------------------------------
# CRUD
- Read
At home page,"Find Book Information by ISBN" and "Show all book information" button can also be used to read the book file.

First,click "Find Book Information by ISBN" button, input the isbn code and click "search" button. The result will be displayed, click on the book name hyperlink to get the complete information of the book.

Second,click "Show all book information" button, all the book with book name will be displayed, click on the book name hyperlink to get the complete information of the book.
----------------------------------------------------
# CRUD 
- Update
After entering the details ejs, the user can update the book's information.

The ISBN attribute displayed above is mandatory and cannot be changed. 
Besides that, the following attributes can be edited.
1)Book Name 
2)Category 
3)Publisher 
4)Author 
5)Remark 
----------------------------------------------------
# CRUD 
- Delete
-After entering the details ejs, the user can delete the whole book information. 

----------------------------------------------------
# Restful
We have indicated four types of HTTP request, which are post, get, put and delete.
- Post 
	Using post to add a book to the management system
	Path URL: '/api/item/isbn/:isbn'
	Example: curl -X POST -H "Content-Type: application/json" --data '{"bookname":"Hello","isbn":"1234567891123","category":"fiction","pubilsher":"edf Inc.","author":"Ho","remark":"how are you"}' localhost:8099/api/item/isbn/1234567891123

- Get
	Using post to find a book to the management system
	Path URL: '/api/item/isbn/:isbn'
	Example: curl -X GET localhost:8099/api/item/isbn/9781613820254

- Put
	Using post to update a book to the management system
	Path URL: '/api/item/isbn/:isbn'
	Example: curl -H "Content-Type: application/json" -X PUT -d '{"bookname":"HelloWorld"}' localhost:8099/api/item/isbn/9781613820254

- Delete
	Delete request is used for deletion.
	Path URL: '/api/item/isbn/:isbn'
	Example: curl -X DELETE localhost:8099/api/item/isbn/9781613820254

