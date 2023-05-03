const loginRoles = {
    admin: ['admin'],
    intro: ['intro'],
    employer: ['employer'],
    friend: ['friend'],
    family: ['family'],
    all_but_admin: ['intro', 'employer', 'friend', 'family'],
    needs_approval: ['admin', 'friend', 'family'],
    all: ['admin', 'intro', 'employer', 'friend', 'family']
};

export default loginRoles;