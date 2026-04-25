-- ============================================================================
-- EventConnect demo seed: 30 fake attendees for a GDG Hyderabad-style event.
--
-- These rows go into BOTH auth.users (so the FK on public.users.id is satisfied)
-- AND public.users (the profile data the app actually reads).
--
-- Re-running this file is safe: every insert uses ON CONFLICT.
-- Requires the pgcrypto extension (Supabase enables it by default).
-- ============================================================================

create extension if not exists pgcrypto;

begin;

-- ---------- 1. priya.r@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000001'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'priya.r@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, company)
values ('11111111-1111-1111-1111-000000000001'::uuid, 'priya.r@example.test', 'Priya Reddy', 'Backend dev exploring AI agents', array['Go','Postgres','Gemini','Firebase'], array['AI agents','startups','retrieval'], 'Find a hackathon team', array['Frontend dev','UX designer'], 'Razorpay')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, company=excluded.company, updated_at=now();

-- ---------- 2. rahul.k@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000002'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'rahul.k@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, company)
values ('11111111-1111-1111-1111-000000000002'::uuid, 'rahul.k@example.test', 'Rahul Kumar', 'Flutter dev shipping a fintech side project', array['Flutter','Dart','Firebase','Riverpod'], array['mobile UX','fintech','indie hacking'], 'Find collaborators', array['Backend dev','Designer'], 'Zerodha')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, company=excluded.company, updated_at=now();

-- ---------- 3. ananya.s@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000003'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'ananya.s@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, college)
values ('11111111-1111-1111-1111-000000000003'::uuid, 'ananya.s@example.test', 'Ananya Sharma', 'CS senior shipping side projects', array['Python','PyTorch','LLMs','RAG'], array['AI research','open source','NLP'], 'Get hired', array['Mentor','ML engineer'], 'IIIT Hyderabad')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, college=excluded.college, updated_at=now();

-- ---------- 4. kiran.m@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000004'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'kiran.m@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, company)
values ('11111111-1111-1111-1111-000000000004'::uuid, 'kiran.m@example.test', 'Kiran Mehta', 'Founding engineer at a payments startup', array['Go','gRPC','Postgres','Kafka'], array['payments','distributed systems','scale'], 'Hire', array['Backend dev','SRE'], 'Razorpay')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, company=excluded.company, updated_at=now();

-- ---------- 5. aditya.v@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000005'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'aditya.v@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, company)
values ('11111111-1111-1111-1111-000000000005'::uuid, 'aditya.v@example.test', 'Aditya Verma', 'Full-stack dev who lives in Next.js', array['React','Next.js','TypeScript','Tailwind'], array['DX','design systems','SaaS'], 'Find a hackathon team', array['Backend dev','Designer'], 'Postman')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, company=excluded.company, updated_at=now();

-- ---------- 6. sneha.p@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000006'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'sneha.p@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, company)
values ('11111111-1111-1111-1111-000000000006'::uuid, 'sneha.p@example.test', 'Sneha Patel', 'Data engineer wrangling pipelines at scale', array['BigQuery','Airflow','dbt','Python'], array['data platforms','analytics','observability'], 'Learn', array['ML engineer','Data scientist'], 'Swiggy')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, company=excluded.company, updated_at=now();

-- ---------- 7. vikram.j@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000007'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'vikram.j@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, company)
values ('11111111-1111-1111-1111-000000000007'::uuid, 'vikram.j@example.test', 'Vikram Joshi', 'iOS engineer who also dabbles in Flutter', array['Swift','SwiftUI','Flutter','Firebase'], array['mobile','AR','consumer apps'], 'Find collaborators', array['Designer','Backend dev'], 'Hotstar')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, company=excluded.company, updated_at=now();

-- ---------- 8. divya.n@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000008'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'divya.n@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, company)
values ('11111111-1111-1111-1111-000000000008'::uuid, 'divya.n@example.test', 'Divya Nair', 'PM-turned-engineer building internal AI tools', array['Python','LangChain','Gemini','Postgres'], array['AI agents','prompt eng','dev productivity'], 'Hire', array['ML engineer','Frontend dev'], 'Freshworks')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, company=excluded.company, updated_at=now();

-- ---------- 9. karthik.r@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000009'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'karthik.r@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, company)
values ('11111111-1111-1111-1111-000000000009'::uuid, 'karthik.r@example.test', 'Karthik Raju', 'DevOps lead, lover of small YAML files', array['Kubernetes','Terraform','GCP','ArgoCD'], array['platform eng','SRE','cost optimization'], 'Just exploring', array['Mentor','Backend dev'], 'CRED')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, company=excluded.company, updated_at=now();

-- ---------- 10. meera.b@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000010'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'meera.b@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, college)
values ('11111111-1111-1111-1111-000000000010'::uuid, 'meera.b@example.test', 'Meera Bhat', 'Final-year ML student into multimodal models', array['Python','PyTorch','Transformers','CLIP'], array['multimodal','vision','research'], 'Get hired', array['Mentor','ML engineer'], 'IIT Bombay')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, college=excluded.college, updated_at=now();

-- ---------- 11. arjun.d@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000011'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'arjun.d@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, company)
values ('11111111-1111-1111-1111-000000000011'::uuid, 'arjun.d@example.test', 'Arjun Desai', 'Flutter dev building delivery-fleet apps', array['Flutter','Dart','Bloc','Maps SDK'], array['logistics','offline-first apps','real-time'], 'Find collaborators', array['Backend dev','Designer'], 'Dunzo')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, company=excluded.company, updated_at=now();

-- ---------- 12. pooja.g@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000012'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'pooja.g@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, company)
values ('11111111-1111-1111-1111-000000000012'::uuid, 'pooja.g@example.test', 'Pooja Gupta', 'Product designer crossing into front-end', array['Figma','Tailwind','React','Framer'], array['design systems','accessibility','motion'], 'Find a hackathon team', array['Frontend dev','PM'], 'Zomato')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, company=excluded.company, updated_at=now();

-- ---------- 13. rohan.t@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000013'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'rohan.t@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, company)
values ('11111111-1111-1111-1111-000000000013'::uuid, 'rohan.t@example.test', 'Rohan Tiwari', 'Backend engineer obsessed with caching', array['Node.js','Redis','Postgres','TypeScript'], array['perf','caching','API design'], 'Just exploring', array['Backend dev','SRE'], 'Meesho')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, company=excluded.company, updated_at=now();

-- ---------- 14. lakshmi.s@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000014'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'lakshmi.s@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, company)
values ('11111111-1111-1111-1111-000000000014'::uuid, 'lakshmi.s@example.test', 'Lakshmi Subramaniam', 'ML platform engineer at a streaming co', array['Python','Kubeflow','Vertex AI','GCP'], array['MLOps','feature stores','infra'], 'Hire', array['ML engineer','Data engineer'], 'Hotstar')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, company=excluded.company, updated_at=now();

-- ---------- 15. tanmay.c@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000015'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'tanmay.c@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, college)
values ('11111111-1111-1111-1111-000000000015'::uuid, 'tanmay.c@example.test', 'Tanmay Chowdhury', 'Mentor for first-time hackathon teams', array['Go','Postgres','Docker','GCP'], array['mentoring','open source','community'], 'Just exploring', array['Beginner devs','Hackers'], 'BITS Pilani')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, college=excluded.college, updated_at=now();

-- ---------- 16. aisha.k@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000016'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'aisha.k@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, company)
values ('11111111-1111-1111-1111-000000000016'::uuid, 'aisha.k@example.test', 'Aisha Khan', 'Flutter dev shipping a meditation app', array['Flutter','Dart','Riverpod','Supabase'], array['wellness apps','indie hacking','mobile UX'], 'Find collaborators', array['Designer','Backend dev'], 'BYJU''S')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, company=excluded.company, updated_at=now();

-- ---------- 17. nikhil.a@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000017'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'nikhil.a@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, company)
values ('11111111-1111-1111-1111-000000000017'::uuid, 'nikhil.a@example.test', 'Nikhil Agarwal', 'Founding engineer at a stealth AI startup', array['Python','LLMs','RAG','Pinecone'], array['agents','startups','retrieval'], 'Hire', array['ML engineer','Frontend dev'], 'Stealth')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, company=excluded.company, updated_at=now();

-- ---------- 18. riya.m@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000018'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'riya.m@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, college)
values ('11111111-1111-1111-1111-000000000018'::uuid, 'riya.m@example.test', 'Riya Menon', 'CS sophomore who lives in React', array['React','Next.js','TypeScript','Tailwind'], array['frontend','design systems','open source'], 'Find a hackathon team', array['Backend dev','Designer'], 'NIT Warangal')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, college=excluded.college, updated_at=now();

-- ---------- 19. ishaan.p@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000019'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'ishaan.p@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, company)
values ('11111111-1111-1111-1111-000000000019'::uuid, 'ishaan.p@example.test', 'Ishaan Pandey', 'Android dev moving to Kotlin Multiplatform', array['Kotlin','KMP','Compose','Jetpack'], array['mobile','cross-platform','perf'], 'Learn', array['Mentor','iOS dev'], 'Flipkart')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, company=excluded.company, updated_at=now();

-- ---------- 20. zara.h@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000020'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'zara.h@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, company)
values ('11111111-1111-1111-1111-000000000020'::uuid, 'zara.h@example.test', 'Zara Hussain', 'GenAI engineer wiring Gemini into prod', array['Python','Gemini','LangChain','FastAPI'], array['AI agents','RAG','evals'], 'Find collaborators', array['ML engineer','Backend dev'], 'PhonePe')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, company=excluded.company, updated_at=now();

-- ---------- 21. aarav.s@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000021'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'aarav.s@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, company)
values ('11111111-1111-1111-1111-000000000021'::uuid, 'aarav.s@example.test', 'Aarav Singh', 'Senior backend dev who loves Go and beer', array['Go','gRPC','Postgres','Kafka'], array['distributed systems','observability','OSS'], 'Hire', array['Backend dev','SRE'], 'Dream11')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, company=excluded.company, updated_at=now();

-- ---------- 22. diya.r@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000022'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'diya.r@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, college)
values ('11111111-1111-1111-1111-000000000022'::uuid, 'diya.r@example.test', 'Diya Rao', 'Cloud intern dabbling in everything Google', array['GCP','Firebase','Cloud Run','TypeScript'], array['serverless','cloud','student-built apps'], 'Get hired', array['Mentor','Backend dev'], 'IIIT Hyderabad')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, college=excluded.college, updated_at=now();

-- ---------- 23. vivaan.k@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000023'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'vivaan.k@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, company)
values ('11111111-1111-1111-1111-000000000023'::uuid, 'vivaan.k@example.test', 'Vivaan Kapoor', 'Flutter team lead at an edtech', array['Flutter','Dart','GraphQL','Firebase'], array['mobile architecture','edtech','team building'], 'Hire', array['Flutter dev','Designer'], 'BYJU''S')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, company=excluded.company, updated_at=now();

-- ---------- 24. kavya.i@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000024'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'kavya.i@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, company)
values ('11111111-1111-1111-1111-000000000024'::uuid, 'kavya.i@example.test', 'Kavya Iyer', 'Data scientist working on personalization', array['Python','SQL','BigQuery','TensorFlow'], array['recsys','experimentation','growth'], 'Find collaborators', array['ML engineer','Data engineer'], 'ShareChat')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, company=excluded.company, updated_at=now();

-- ---------- 25. yash.p@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000025'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'yash.p@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, company)
values ('11111111-1111-1111-1111-000000000025'::uuid, 'yash.p@example.test', 'Yash Pillai', 'Indie hacker shipping a Flutter+Supabase SaaS', array['Flutter','Supabase','Stripe','Edge Functions'], array['indie hacking','SaaS','solopreneur'], 'Find collaborators', array['Designer','Marketer'], 'Indie')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, company=excluded.company, updated_at=now();

-- ---------- 26. sara.m@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000026'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'sara.m@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, college)
values ('11111111-1111-1111-1111-000000000026'::uuid, 'sara.m@example.test', 'Sara Mathew', 'Robotics + ML research student', array['Python','ROS','PyTorch','C++'], array['robotics','RL','simulation'], 'Learn', array['Mentor','ML engineer'], 'IIT Madras')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, college=excluded.college, updated_at=now();

-- ---------- 27. aryan.b@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000027'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'aryan.b@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, company)
values ('11111111-1111-1111-1111-000000000027'::uuid, 'aryan.b@example.test', 'Aryan Bhattacharya', 'Frontend lead, Tailwind evangelist', array['React','Next.js','Tailwind','Storybook'], array['design systems','accessibility','DX'], 'Hire', array['Frontend dev','Designer'], 'Postman')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, company=excluded.company, updated_at=now();

-- ---------- 28. ira.s@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000028'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'ira.s@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, college)
values ('11111111-1111-1111-1111-000000000028'::uuid, 'ira.s@example.test', 'Ira Sundaram', 'CS junior, first-time hackathon attendee', array['JavaScript','React','Firebase','Python'], array['web','community','learning'], 'Find a hackathon team', array['Mentor','Frontend dev'], 'JNTUH')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, college=excluded.college, updated_at=now();

-- ---------- 29. reyansh.g@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000029'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'reyansh.g@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, company)
values ('11111111-1111-1111-1111-000000000029'::uuid, 'reyansh.g@example.test', 'Reyansh Goyal', 'SRE keeping a trading platform alive', array['Kubernetes','Terraform','Prometheus','Go'], array['SRE','observability','low-latency systems'], 'Just exploring', array['Backend dev','SRE'], 'Zerodha')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, company=excluded.company, updated_at=now();

-- ---------- 30. mira.j@example.test ----------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('11111111-1111-1111-1111-000000000030'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'mira.j@example.test', crypt('seed-password-99', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into public.users (id, email, name, headline, skills, interests, goal, looking_for, company)
values ('11111111-1111-1111-1111-000000000030'::uuid, 'mira.j@example.test', 'Mira Jain', 'Flutter dev who teaches Dart on weekends', array['Flutter','Dart','Firebase','Stripe'], array['mobile','teaching','community'], 'Find collaborators', array['Backend dev','Designer'], 'Ola')
on conflict (id) do update set name=excluded.name, headline=excluded.headline, skills=excluded.skills, interests=excluded.interests, goal=excluded.goal, looking_for=excluded.looking_for, company=excluded.company, updated_at=now();

commit;
